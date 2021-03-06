const { response } = require("express")
const { request } = require("express")
const bcrypt = require("bcryptjs")
const User = require("../models/Users")
const jwt = require("jsonwebtoken")
const path  = require('path')

const publicdirectorypath=path.join(__dirname,'../../views')

exports.register = async (request, response) => {
    
    const { username,email,password } = request.body
    console.log(username);

    try {
        let user = await User.findOne({UserName: username.toLowerCase()})
        if(user)
           return response.status(422).send("username is already reg")

        let newUser = new User({
            UserName: username,
            email: email.toLowerCase().replace(/\s+/,""),
            password,
        })

        //hashing the password

        const hash = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(username+password,hash)


        //save the user
        await newUser.save()

        //send the response to server

        response.status(201).redirect("/login")

    } catch (err){

        console.error(err.message)
        response.status(500).send("server error")

    }
    
}

/*_____login functionality is below_____*/

exports.login = async (request, response) => {
    
    //validating
    

    const { username, password } = request.body

    try {


        //console.log(email+" "+password);
        const user = await User.findOne({UserName: username.toLowerCase()})

        //check whether it exists or not
        if(!user) 
           return response.status(422).send("invalid creds")

        //emails exists but check for password
        let checkPassword =await bcrypt.compare(username+password,user.password)

        //check whether password correct or not
        if(!checkPassword)
        return response.status(422).send("invalid creds")
    
        request.session.user = username
        console.log("login: "+request.session)
         await request.session.save(err=>{
                if(err)
                {
                    console.log("error occured in sessions")
                }else{
                    console.log("/"+"?username="+username)
                    response.status(200)
                    .redirect("/"+"?username="+username)
                }
            })
        

        console.log("login happened")
        //account is good to go

        // const payload = {
        //     user: {
        //         id: user._id,
        //         username: user.username,
        //         email: user.email
        //     }
        // }

        // jwt.sign(
        //     payload,
        //     "jwtkey",
        //     {expiresIn: 3600},
        //     (err,token) => {
        //         if(err) throw err

                

        //     }
        // )
    

    } catch (err) {
        console.log(err.message)
        response.status(500).sendStatus(response.statusCode)
    }
}


//update
exports.update = async (request, response) => {
    
    //validating
    
    console.log(request.body)

    let { LeetCodeHandle, CodeChefHandle, CodeForcesHandle, GithubHandle } = request.body

    try {
        //console.log(email+" "+password);
        let tempUser = await User.findOne({UserName: request.session.user})

        if(LeetCodeHandle==='' || LeetCodeHandle===null){
            LeetCodeHandle = tempUser.LeetCodeHandle
        }
        if(CodeChefHandle==='' || CodeChefHandle===null){
            CodeChefHandle = tempUser.CodeChefHandle
        }
        if(CodeForcesHandle==='' || CodeForcesHandle===null){
            CodeForcesHandle = tempUser.CodeForcesHandle
        }
        if(GithubHandle==='' || GithubHandle===null){
            GithubHandle = tempUser.GithubHandle
        }

       const user = await User.findOneAndUpdate({UserName: request.session.user},{LeetcodeHandle: LeetCodeHandle, CodeChefHandle: CodeChefHandle
        , CodeForcesHandle: CodeForcesHandle, GithubHandle: GithubHandle})

        console.log(user)
        //check whether it exists or not
        if(!user) 
           return response.status(422).send("Something went wrong")

           response.redirect("/"+"?username="+user.UserName)
        

    } catch (err) {
        console.log(err.message)
        response.status(500).sendStatus(response.statusCode)
    }
}
