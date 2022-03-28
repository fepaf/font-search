const axios = require("axios");
const express = require("express");
const fs = require("fs");
const http = require("http");
const path = require("path");

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
    const dirname = path.join(__dirname, "files", family);;

    if (!fs.existsSync(dirname)){
        fs.mkdirSync(dirname, {recursive: true },  (err) => {
            if (err) throw err;
        });
    }
    const path_complete = path.join(dirname, `${file_name}.ttf`); 
    const filePath = fs.createWriteStream(path_complete);
    response.pipe(filePath);
    filePath.on('finish',() => {
        filePath.close();
        console.log('Download Completed'); 
    });
}

search_file = function(prefix_path, file_target){

    if (!fs.existsSync(prefix_path)){
        console.log(`No directory ${prefix_path}`);
        return false;
    }

    var files = fs.readdirSync(prefix_path);
    var result = false;
    for (var i=0; i<files.length; i++){
        var filename = path.join(prefix_path, files[i]);

        if (files[i] === file_target){
            return true;
        }

        var status = fs.lstatSync(filename);
        if (status.isDirectory()){
            result |= search_file(filename, file_target);
        }
    }

    return result;
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

app.get('/search', (request, response) => {
    const { fontname } = request.query;

    search_status= search_file(__dirname, fontname);

    response.status(200).json({message : search_status ? "Found" : "Not Found"});
});

app.listen(9001, '0.0.0.0', () => {
    console.log("Aplication started!");
});
