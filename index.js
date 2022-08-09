const express = require('express');
const handlebars = require('express-handlebars');

const Contenedor = require('./service/Contenedor');

let contenedor = new Contenedor('data/productos.txt');

const app = express();

const hbs = handlebars.create({});

/*
Se registra nuevo helper para preguntar si 
si el campo Foto URL tiene de tipo extension
una imagen para usarlo en productos.hbs
SI tiene imagen muestra con <img> SI NO muestra solo el texto
*/
hbs.handlebars.registerHelper('includeImg', function(array) {   
    return array.includes(".png")  
    || array.includes(".jpg") 
    || array.includes(".gif") 
    || array.includes(".webp")
})

app.engine(
    'hbs', 
    handlebars.engine({
        extname: '.hbs',
        defaultLayout: 'index.hbs',
        layoutsDir: __dirname + '/views/layouts',
        partialsDir: __dirname + '/views/partials'
    })
);

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'hbs');
app.set('views', './views');

app.get('/', (req, res) => {
    res.render('main');
});

app.post('/productos', async (req, res) => {
    const { name, price, photo } = req.body;
    console.log("productos: ", name, price, photo);
    try {
        await contenedor.save(name, price, photo);//almaceno en el file el producto
        res.redirect('/');
    } catch (err) {
        res.status(500).json({
            message: 'Error al guardar el producto',
            err
        });
    }
})

app.get('/productos', async (req, res) => {
    let productos;
    try {
        productos = await contenedor.getAll();
        console.log(productos);
        const products = productos;
        return res.render('pages/productos', {
            products: products,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al obtener los productos',
            error
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}).on('error', err => {
    console.log(err);
});