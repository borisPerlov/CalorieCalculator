

const cloudinary = require('cloudinary').v2;

async function upload(url) {

    cloudinary.config({
        cloud_name: 'dxshuzlz8',
        api_key: '394934666871664',
        api_secret: 'ybeJDBxY8UyagneTBRAdfZVPLyk'
    });

    const data = await cloudinary.uploader.upload(url);
    return {
        url: data?.secure_url,
    };


    // await cloudinary.uploader.upload(url,
    //     function (error, result) {
    //         return result
    //     }

    // );
}




module.exports = {
    upload
}
