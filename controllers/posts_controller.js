//const { content } = require('har-validator');
const Post = require('../models/posts');
const Comment = require('../models/comments');
const Like = require('../models/like');

module.exports.create = async function(req,res){
    try{
        let post =await Post.create({
            content : req.body.content,
            user : req.user._id
        });
        
        if(req.xhr){
           // post = await post.populate('user', 'name').execPopulate();
           post = await post.populate('user', 'name');
            return res.status(200).json({
                data:{
                    post : post
                },
                message : "Post created!"
            })
        }
       // console.log(post);
        req.flash('success','Post Published');
        return res.redirect('back');
    }catch(err){
        req.flash('error',err);
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.destroy = async function(req,res){
    try{
        let post = await Post.findById(req.params.id);
        // .id means converting the object id into string
        // so there is no need to write _id
        if(post.user == req.user.id){
            //let id = req.params.id;

            // delete the associated likes for the post and all its comments likes too
            await Like.deleteMany({likeable : post, onModel : 'Post'});
            await Like.deleteMany({_id : {$in : post.comments}});


            await Post.findByIdAndDelete(req.params.id);
            await Comment.deleteMany({post:req.params.id});
            
            if(req.xhr){
                return res.status(200).json({
                    data : {
                        post_id : req.params.id
                    },
                    message : 'Post deleted'
                })
            }

            req.flash('success','Post and associated Comments deleted');
            return res.redirect('back');
        }
        else{
            req.flash('error',err);
            return res.redirect('back');
        }
    }
    catch(err){
        req.flash('error',err);
        return res.redirect('back');
    }
}