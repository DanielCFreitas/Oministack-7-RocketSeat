const Post = require('../models/Post')
const sharp = require('sharp')
const path = require('path')
const fileSystem = require('fs')

module.exports = {
    async index(req, res) {
        const posts = await Post.find().sort('-createdAt')

        return res.json(posts)
    },

    async store(req, res) {
        const { author, place, description, hashtags } = req.body
        let { filename: image } = req.file

        const [name] = image.split('.')
        image = `${name}.jpg`

        await sharp(req.file.path)
            .resize(500)
            .jpeg({ quality: 70 })
            .toFile(
                path.resolve(req.file.destination, 'resized', image)
            )

        fileSystem.unlinkSync(req.file.path)

        console.log(image)

        const post = await Post.create({
            author,
            place,
            description,
            hashtags,
            image
        })

        req.io.emit('post', post)

        return res.json(post)
    }
}