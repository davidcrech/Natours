const fs = require('fs');
const morgan = require('morgan');
const express = require('express');

const app = express();

// 1) MIDDLEWARES

app.use(morgan('dev'));
app.use(express.json());

// app.get('/', (req, res) => {
//     res
//         .status(200)
//         .json({message: 'Hello from the server side!', app: 'Natours'});
// })

// app.post('/', (req, res) => {
//     res.send('you can post to this endpoint')
// })

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// 2) ROUTE HANDLERS

const getAllTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        } 
    })
}

const getTour = (req, res) => {

    const id = +req.params.id;

        if (id > tours.length) {
            return res.status(404).json({
                status: "fail",
                message: 'Invalid ID'
            });
        };

    const tour = tours.find(el => el.id === id);
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
}

const createTour = (req, res) => {
    // console.log(req.body);

    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({id : newId}, req.body);

    tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
    });
}

const updateTour = (req, res) => {
    if (+req.params.id > tours.length) {
        return res.status(404).json({
            status: "fail",
            message: 'Invalid ID'
        });
    };

    res.status(200).json({
        status: 'success',
        data: {
            tour: '<Updated tour>'
        }
    })
}

const deleteTour = (req, res) => {
    if (+req.params.id > tours.length) {
        return res.status(404).json({
            status: "fail",
            message: 'Invalid ID'
        });
    };

    res.status(204).json({
        status: 'success',
        data: null
    })
}

const getAllUsers = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined'
    });
}
const getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined'
    });
}
const createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined'
    });
}
const updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined'
    });
}
const deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'this route is not yet defined'
    });
}

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('api/v1/tours/:id', updateTour)
// app.delete('api/v1/tours/:id', deleteTour)

// 4) ROUTES

const tourRouter = express.Router();
const userRouter = express.Router();

tourRouter
.route('/')
.get(getAllTours)
.post(createTour)

tourRouter
.route('/:id')
.get(getTour)
.patch(updateTour)
.delete(deleteTour)

userRouter
.route('/')
.get(getAllUsers)
.post(createUser);

userRouter
.route('/:id')
.get(getUser)
.patch(updateUser)
.delete(deleteUser);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter)

// START THE SERVER

const port = 3000;
app.listen(port, () => {
    console.log(`app running on ${port}...`)
}); 

