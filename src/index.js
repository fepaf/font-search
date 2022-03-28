const express = require("express");
const fs = require("fs");
const axios = require("axios");
const http = require("http");

app = express();

const KEY_API = "AIzaSyCZod2Djb1dImg7Bwu_gICXHV04eQAbC5c";
const URL = "https://www.googleapis.com/webfonts/v1/webfonts";

async function get_fonts(font_name){
    try{
        const response = await axios.get(URL, {
            params: {
                key: KEY_API
            }
        });

        fonts = response.data.items;

        fonts_results = fonts.filter(elem => elem.family === font_name);

        return fonts_results;
    } catch(error){
        console.log(error);
        return [];
    }
}

save_file = function(response, family, file_name){
    const dirname = `${__dirname}/files/${family}`;

    if (!fs.existsSync(dirname)){
        fs.mkdirSync(dirname, {recursive: true },  (err) => {
            if (err) throw err;
        });
    }
    const path = `${dirname}/${file_name}.ttf`; 
    const filePath = fs.createWriteStream(path);
    response.pipe(filePath);
    filePath.on('finish',() => {
        filePath.close();
        console.log('Download Completed'); 
    });
}

app.get('/download', async (request, response) => {
    const { fontname } = request.query;
    
    const fonts_to_save = await get_fonts(fontname);

    fonts_to_save.forEach(element => {
        
        element.variants.forEach(async (variant) => {
            console.log(`links ${variant} : ${element.files[variant]}`);
            await http.get(element.files[variant], (res) => {
                save_file(res, element.family, variant);
            });
        });
        
    });
    
    response.status(200).json({data: fonts_to_save});
});

app.listen(9001, '0.0.0.0', () => {
    console.log("Aplication started!");
});
