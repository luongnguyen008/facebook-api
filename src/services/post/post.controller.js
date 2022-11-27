import { isValidObjectId } from "mongoose";
import Post from "../../models/post.model.js";
import User from "../../models/user.model.js";
import { isImage, isVideo } from "../helper.js";

export const addPost = async (req, res, next) => {
	try {
		let {described, status, token} = req.body
		if(!token) {
			return res.send({
				code: "1004",
				message: "Parameter value is invalid",
			})
		}
		if(req.files['images']) {
			if(req.files['images']?.some(x=> !isImage(x.mimetype))){
				return res.send({
					code: "1004",
					message: "Parameter value is invalid",
				})
			}
		}
		if(req.files['videos']) {
			if(req.files['videos']?.some(x=> !isVideo(x.mimetype))){
				return res.send({
					code: "1004",
					message: "Parameter value is invalid",
				})
			}
		}
		let images = req.files['images']?.filter(x => isImage(x.mimetype)) ?? [];
		let videos = req.files['videos']?.filter(x => isVideo(x.mimetype)) ?? [];
		
		if(images.length && videos.length) {
			return res.send({
				code: "1004",
				message: "Parameter value is invalid",
			})
		}
		if(images.length > 4) {
			return res.send({
				code: "1008",
				message: "Maximum number of images",
			})
		}
		if(videos.length > 1) {
			return res.send({
				code: "1008",
				message: "Maximum number of videos",
			})
		}
		console.log("imagesCount", images.length);
		console.log("videosLength", videos.length);
		User.find({'session.token': token}, function(err, user) {
			if (user.length) {
				
				if(!described) {
					return res.send({
						code: "1004",
						message: "Parameter value is invalid",
					})
				}
				
				if(images){
					if(images.some(img => img.size >2000000)) {
						return res.send({
							code: "1006",
							message: "File size is too big",
						})
					}
					else {
						let a = images.map((img, index) => ({path: img.path.split('/').slice(1).join('/'), index: index}))
						console.log(user);
						const newPost = new Post({
							ownerId: user[0]._id,
							described: described,
							images: a,
							status: status
						});
						newPost.save(async (err, addedPost) => {
							if (err) throw err;
							console.log(addedPost);
							return res.send({
								code: "1000",
								message: "OK",
								data: {
									id: addedPost._id.toString()
								}
							})
						})
					}
				}
				if(videos){
					if(videos.some(video => video.size >20000000)) {
						return res.send({
							code: "1006",
							message: "File size is too big",
						})
					}
					else {
						let a = videos.map((video, index) => ({path: video.path.split('/').slice(1).join('/'), index: index}))
						console.log(user);
						const newPost = new Post({
							ownerId: user[0]._id,
							described: described,
							videos: a,
							status: status
						});
						newPost.save(async (err, addedPost) => {
							if (err) throw err;
							console.log(addedPost);
							return res.send({
								code: "1000",
								message: "OK",
								data: {
									id: addedPost._id.toString()
								}
							})
						})
					}
				}
			}
			else {
				return res.send({
					code: "9998",
					message: "Token is invalid",
				})
			}
		})
		
	} catch (error) {
		console.log(error);
		return res.send({
			code: "9999",
			message: "Exception Error",
		})
	}
	
};

export const getPost = async (req, res, next) => {
	try {
		let {token, id } = req.body
		console.log(id, token,isValidObjectId(id) );
		if(!token) {
			return res.send({
				code: "1004",
				message: "Parameter value is invalid",
			})
		}
		User.find({'session.token': token}, async function(err, user) {
			if (user.length) {
				if(!isValidObjectId(id)){
					return res.send({
						code: "1004",
						message: "Parameter value is invalid",
					})
				}
				
				let post = await Post.findOne({_id: id})
				if(post) {
					console.log(post)
					return res.send({
						code: "1000",
						message: "OK",
						data: {
							id: post._id.toString(),
							described: post.described,
							created: post.createdAt,
							modified: post.updatedAt,
							like: post.react_user.length,
							comment: post.comments.length,
							is_liked: post.react_user.includes(user[0]._id) ? 1 : 0,
							image: post.images ? post.images.map(x => ({id: x.index, url: "http://localhost:5555/"+x.path})) : [],
							video: post.videos ? post.videos: [],
							author: {
								id: post.ownerId,
							},
							banned: post.reports.length > 2 ? 1 : 0
						}
					})
				} else {
					res.send({
						code: "9992",
						message: "Post is not existed",
					})
				}
				
			}
			else {
				res.send({
					code: "9998",
					message: "Token is invalid",
				})
			}
		})
		
	} catch (error) {
		res.send({
			code: "9999",
			message: "Exception Error",
		})
	}
}

export const editPost = async (req, res, next) => {
	try {
		let {described, status, token, id, image_del, image_sort, } = req.body
		if(!token) {
			return res.send({
				code: "1004",
				message: "Parameter value is invalid",
			})
		}
		let images = req.files;
		User.find({'session.token': token}, async function(err, user) {
			if (user.length) {
				if(!isValidObjectId(id)){
					return res.send({
						code: "1004",
						message: "Parameter value is invalid",
					})
				}
				let post = await Post.findOne({_id: id})
				if(post) {
					console.log(post)
					let newImageArr = [];
					let result
					if(post.images.length){
						if(image_del.length) {
							let tempArr = image_del.filter(ele=> ele < post.images.length && ele >= 0)
							if (tempArr.length ==0) {
								res.send({
									code: "1004",
									message: "Parameter value is invalid",
								})
							}
							console.log(tempArr);
							// xóa image và cập nhật lại index
							newImageArr = post.images.filter(img => !tempArr.includes(img.index.toString()))
							console.log(newImageArr);
						}
					}else {
						if(image_del.length) {
							res.send({
								code: "1004",
								message: "Parameter value is invalid",
							})
						}
					}
					if(images){
						if(images.some(img => img.size >2000000)) {
							res.send({
								code: "1006",
								message: "File size is too big (2MB)",
							})
						}
						else {
							let a = images.map((img) => ({path: img.path.split('/').slice(1).join('/')}))
							let b = newImageArr.concat(a)
							newImageArr = b
						}
					}
					
					result = newImageArr.map((img, index) => ({path: img.path, index: index}))
					console.log(result);
					let set;
					if(!described && !status) {
						set = {
							"images": result,  
						}
					}else if(!described && status) {
						set = {
							"images": result, 
							"status": status
						}
					}else if(described && !status) {
						set = {
							"images": result, 
							"described": described, 
						}
					}else {
						set = {
							"images": result,  
							"described": described, 
							"status": status
						}
					}
					const updatedPost = await Post.findOneAndUpdate(
						{ _id: id },
						{ $set: set},
						{ new: true }
					);
					res.send({
						code: "1000",
						message: "OK",
						data: {
							id: updatedPost._id.toString()
						}
					})
				} else {
					res.send({
						code: "9992",
						message: "Post is not existed",
					})
				}
				
			}
			else {
				res.send({
					code: "9998",
					message: "Token is invalid",
				})
			}
		})
		
	} catch (error) {
		res.send({
			code: "9999",
			message: "Exception Error",
		})
	}
}

export const deletePost = async (req, res, next) => {
	try {
		let {id, token} = req.body
		if(!token) {
			return res.send({
				code: "1004",
				message: "Parameter value is invalid",
			})
		}
		if(!isValidObjectId(id)){
			return res.send({
				code: "1004",
				message: "Parameter value is invalid",
			})
		}
		console.log(req.body);
		User.find({'session.token': token}, async function(err, user) {
			if (user.length) {
				let post = await Post.findOne({_id: id})
				if(post) {
					Post.deleteOne({ _id: id }, function (err) {
						if (err) throw err;
						res.send({
							code: "1000",
							message: "OK",
						})
					});
				}else {
					res.send({
						code: "1004",
						message: "Parameter value is invalid",
					})
				}
			}
			else {
				res.send({
					code: "9998",
					message: "Token is invalid",
				})
			}
		})
		
	} catch (error) {
		res.send({
			code: "9999",
			message: "Exception Error",
		})
	}
}

export const reportPost = async (req, res, next) => {
	try {
		let {id, token, subject, details} = req.body
		if(!token) {
			return res.send({
				code: "1004",
				message: "Parameter value is invalid",
			})
		}
		console.log(req.body);
		User.find({'session.token': token}, async function(err, user) {
			if (user.length) {
				if(!isValidObjectId(id)){
					return res.send({
						code: "1004",
						message: "Parameter value is invalid",
					})
				}
				let post = await Post.findOne({_id: id})
				if(post) {
					let cloneReport = JSON.parse(JSON.stringify(post.reports)) ? JSON.parse(JSON.stringify(post.reports)) : []
					cloneReport.push({subject: subject, details: details})
					let newReports = cloneReport
					console.log(newReports);
					const updatedPost = await Post.findOneAndUpdate(
						{ _id: id },
						{ reports: newReports},
						{ new: true }
					);
					if(post.reports.length >2) {
						res.send({
							code: "1010",
							message: "Action has been done previously by this user",
						})
					} else {
						res.send({
							code: "1000",
							message: "OK",
						})
					}
				}else {
					res.send({
						code: "1004",
						message: "Parameter value is invalid",
					})
				}
			}
			else {
				res.send({
					code: "9998",
					message: "Token is invalid",
				})
			}
		})
		
	} catch (error) {
		res.send({
			code: "9999",
			message: "Exception Error",
		})
	}
}

export const like = async (req, res, next) => {
	try {
		let {id, token, subject, details} = req.body
		if(!token) {
			return res.send({
				code: "1004",
				message: "Parameter value is invalid",
			})
		}
		console.log(req.body);
		User.find({'session.token': token}, async function(err, user) {
			if (user.length) {
				if(!isValidObjectId(id)){
					return res.send({
						code: "1004",
						message: "Parameter value is invalid",
					})
				}
				let post = await Post.findOne({_id: id})
				if(post) {
					if(post.reports.length >2) {
						res.send({
							code: "1010",
							message: "Action has been done previously by this user",
						})
					} else {
						let likeArr = post.react_user ? post.react_user : []
						if(likeArr.includes(user[0]._id.toString())){
							likeArr = likeArr.filter(function(userId) {
								return userId !== user[0]._id.toString()
							})
						}else {
							likeArr.push(user[0]._id.toString())
						}
						const updatedPost = await Post.findOneAndUpdate(
							{ _id: id },
							{ react_user: likeArr},
							{ new: true }
						);
						let msg;
						if(updatedPost.react_user.includes(user[0]._id.toString())){
							msg = "OK"
						}else {
							msg = "OK"
						}
						res.send({
							code: "1000",
							message: msg,
							data: {
								like: updatedPost.react_user.length
							}
						})

					}
				}else {
					res.send({
						code: "1004",
						message: "Parameter value is invalid",
					})
				}
			}
			else {
				res.send({
					code: "9998",
					message: "Token is invalid",
				})
			}
		})
		
	} catch (error) {
		res.send({
			code: "9999",
			message: "Exception Error",
		})
	}
}

export const getComment = async (req, res, next) => {
	try {
		let {id, token, index, count} = req.body
		if(!index || !count || index <0|| index > count || count<0) {
			return res.send({
				code: "1004",
				message: "Parameter value is invalid",
			})
		}
		if(!token) {
			return res.send({
				code: "1004",
				message: "Parameter value is invalid",
			})
		}
		if(!isValidObjectId(id)){
			return res.send({
				code: "1004",
				message: "Parameter value is invalid",
			})
		}
		User.find({'session.token': token}, async function(err, user) {
			if (user.length) {
				let post = await Post.findOne({_id: id})
				if(post) {
					if(post.reports.length >2) {
						res.send({
							code: "1010",
							message: "Action has been done previously by this user",
						})
					} else {
						let comments = post.comments ? post.comments : [];
						let cmts= [];
						for(let i =index; i<(index+count); i++) {
							if(comments[i]) {
								cmts.push(comments[i])
							}
						}
						let data = {
							poster : cmts
						}
						res.send({
							code: "1000",
							message: "OK",
							data: data
						})

					}
				}else {
					res.send({
						code: "1004",
						message: "Parameter value is invalid",
					})
				}
			}
			else {
				res.send({
					code: "9998",
					message: "Token is invalid",
				})
			}
		})
		
	} catch (error) {
		res.send({
			code: "9999",
			message: "Exception Error",
		})
	}
}

export const setComment = async (req, res, next) => {
	try {
		let {id, token, comment, index, count} = req.body
		console.log();
		if(!token) {
			return res.send({
				code: "1004",
				message: "Parameter value is invalid",
			})
		}
		if(!comment || !index || !count || index <0|| index > count || count<0) {
			return res.send({
				code: "1004",
				message: "Parameter value is invalid",
			})
		}
		if(!isValidObjectId(id)){
			return res.send({
				code: "1004",
				message: "Parameter value is invalid",
			})
		}
		User.find({'session.token': token}, async function(err, user) {
			if (user.length) {
				let post = await Post.findOne({_id: id})
				if(post) {
					if(post.reports.length >2) {
						res.send({
							code: "1010",
							message: "Action has been done previously by this user",
						})
					} else {
						let comments = post.comments ? post.comments : [];
						let now = Date.now()
						comments.push({
							poster: user[0]._id.toString(),
							comment: comment,
							createAt: now
						})
						const updatedPost = await Post.findOneAndUpdate(
							{ _id: id },
							{ comments: comments},
							{ new: true }
						);

						let cmts= [];
						for(let i =index; i<(index+count); i++) {
							if(updatedPost.comments[i]) {
								cmts.push(updatedPost.comments[i])
							}
						}
						let data = {
							comment: comment,
							created: now,
							poster : cmts
						}
						res.send({
							code: "1000",
							message: "OK",
							data: data
						})


					}
				}else {
					res.send({
						code: "1004",
						message: "Parameter value is invalid",
					})
				}
			}
			else {
				res.send({
					code: "9998",
					message: "Token is invalid",
				})
			}
		})
		
	} catch (error) {
		res.send({
			code: "9999",
			message: "Exception Error",
		})
	}
}

export const getListPosts = async (req, res, next) => {
	try {
		let { token, index, count} = req.body
		if(!token) {
			return res.send({
				code: "1004",
				message: "Parameter value is invalid",
			})
		}
		if(!index || !count || index <0|| index > count || count<0) {
			return res.send({
				code: "1004",
				message: "Parameter value is invalid",
			})
		}
		User.find({'session.token': token}, async function(err, user) {
			if (user.length) {
				let posts = await Post.find({});
				let postRes= [];
				for(let i =index; i<(index+count); i++) {
					if(posts[i]) {
						postRes.push(posts[i])
					}
				}
				res.send({
					code: "1000",
					message: "OK",
					data: {
						posts: postRes.map(post => ({
							...post._doc,
							like: post.react_user.length,
							comment: post.comments.length,
							is_liked: post.comments.length == 0 ? 0: 1
						}))
					}
				})
				console.log(postRes);
			}
			else {
				res.send({
					code: "9998",
					message: "Token is invalid",
				})
			}
		})
		
	} catch (error) {
		console.log(error);
		res.send({
			code: "9999",
			message: "Exception Error",
		})
	}
}

export const checkNewItem = async (req, res, next) => {
	try {
		let { token, last_id, category_id} = req.body
		if(!token) {
			return res.send({
				code: "1004",
				message: "Parameter value is invalid",
			})
		}
		if(!category_id) {
			category_id = 0
		}
		if(!last_id) {
			return res.send({
				code: "1004",
				message: "Parameter value is invalid",
			})
		}
		User.find({'session.token': token}, async function(err, user) {
			if (user.length) {
				let posts = await Post.find({});
				
				let newItemArr = [];
				let index = posts.findIndex(e => e._id.toString() === last_id)
				for(let i= index+1; i<posts.length; i++){
					newItemArr.push(posts[i])
				}
				res.send({
					code: "1000",
					message: "OK",
					data: {
						new_items: newItemArr
					}
				})
			}
			else {
				res.send({
					code: "9998",
					message: "Token is invalid",
				})
			}
		})
		
	} catch (error) {
		console.log(error);
		res.send({
			code: "9999",
			message: "Exception Error",
		})
	}
}
