import User from "../../models/user.model.js"
import { checkPhoneNumber, containsSpecialChars } from "../helper.js"

export const signup = async (req, res, next) => {
	let {phonenumber, password, deviceId} = req.body
	try {
		if(!checkPhoneNumber(phonenumber)) {
			return res.send({
				code: "1004",
				message: "Parameter value is invalid",
			})
		}
		let user = await User.findOne({phonenumber: phonenumber})
		if(user) {
			return res.send({
				code: "9996",
				message: "User existed",
			})
		} else {
			if(phonenumber === password) {
				return res.send({
					code: "1004",
					message: "Parameter value is invalid",
				})
			}
			else if(containsSpecialChars(password)){
				return res.send({
					code: "1004",
					message: "Parameter value is invalid",
				})
			}
			else if(password.length <6 || password.length > 10) {
				return res.send({
					code: "1004",
					message: "Parameter value is invalid",
				})
			}
			else {
				const newUser = new User({
					phonenumber: phonenumber,
					password: password,
					session: {
						deviceId: deviceId,
						token: Math.floor(Math.random() * 1000000)
					}
				});
				newUser.save(async (err, addedUser) => {
					if (err) throw err;
					console.log(addedUser);
					next()
				})
				return res.send({
					code: "1000",
					message: "OK"
				})
			}
		}
	} catch (error) {
		console.log(error);
		return res.send({
			code: error ? "1001" : "9999",
			message: error ? error : "Exception Error",
		})
	}
	
	
}

export const login = async (req, res, next) => {
	try {
		let {phonenumber, password, deviceId} = req.body
		// 5,9
		if(!phonenumber || !password || !deviceId) {
			return res.send({
				code: "1004",
				message: "Parameter value is invalid",
			})
		}
		// 3
		if(!checkPhoneNumber(phonenumber)) {
			return res.send({
				code: "1004",
				message: "Parameter value is invalid",
			})
		}
		let user = await User.findOne({phonenumber: phonenumber})
		if(user) {
			// 7
			if(phonenumber === password) {
				return res.send({
					code: "1004",
					message: "Parameter value is invalid",
				})
			}
			if(password === user.password) {
				const updatedUser = await User.findOneAndUpdate(
					{ phonenumber: phonenumber },
					{ session: {deviceId: deviceId, token: Math.floor(Math.random() * 1000000)} },
					{ new: true }
				);
				// lưu user: {..., session: [{deviceId: deviceId, token: 123456}]}

				return res.send({
					code: "1000",
					message: "OK",
					data: {
						id: updatedUser._id.toString(),
						username: updatedUser.phonenumber,
						token: updatedUser.session.token,
						avatar: "-1"
					}
				})
			} else {
				return res.send({
					code: "1004",
					message: "Parameter value is invalid",
				})
			}
		}else {
			// 2
			return res.send({
				code: "9995",
				message: "User is not validated",
			})
		}
	} catch (error) {
		return res.send({
			code: "9999",
			message: "Exception Error",
		})
	}
	
}

export const logout = async (req, res, next) => {
	try {
		let {token} = req.body
		if(!token) {
			return res.send({
				code: "1004",
				message: "Parameter value is invalid",
			})
		}
		let user = await User.findOne({"session.token": token})
		if(user) {
			const updatedUser = await User.findOneAndUpdate(
				{ phonenumber: user.phonenumber },
				{ session: {} },
				{ new: true }
			);
			return res.send({
				code: "1000",
				message: "OK",
			})
		}
		else {
			return res.send({
				code: "9998",
				message: "Token is invalid",
			})
		}
		console.log(user);
	} catch (error) {
		console.log(error);
		return res.send({
			code: "9999",
			message: "Exception Error",
		})
	}
}