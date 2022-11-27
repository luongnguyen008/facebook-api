export function containsSpecialChars(str) {
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return specialChars.test(str);
}

export function checkPhoneNumber(phonenumber) {
    var vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    if(phonenumber !==''){
        if (vnf_regex.test(phonenumber) == false) 
        {
            return false
        }else{
            return true
        }
    }else{
        return false
    }
}

export function isImage(type) {
    if(type == "image/jpeg"|| type == "image/png"){
        return true
    }
    else return false
}

export function isVideo(type) {
    if(type == "video/x-msvideo"|| type == "video/mp4" || type == "video/mpeg" ||type == "video/ogg"){
        return true
    }
    else return false
}