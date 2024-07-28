const CustomerService = require('../services/customer-service');
const  UserAuth = require('./middlewares/auth');
const { SubscribeMessage } = require('../utils');


module.exports = (app, channel) => {
    
    const service = new CustomerService();

    // To listen
    SubscribeMessage(channel, service);

    app.post('/signup', async (req,res,next) => {
        const { email, password, phone,username, profile } = req.body;
        const { data } = await service.SignUp({ email, password, phone,username, profile}); 
        res.json(data);
    });
    app.delete('/:id', async (req,res,next) => {
        const _id = req.params.id;
     
        const { data } = await service.DeleteCustomer({ _id }); 
        console.log("existingCustomer:",data)
        res.json(data);
    });
    app.post('/login',  async (req,res,next) => {
        
        const { email, password } = req.body;

        const { data } = await service.SignIn({ email, password});

        res.json(data);
    });

    app.patch('/credentials', UserAuth, async (req,res,next) => {
        const { _id } = req.user;
        const { current_password,new_password } = req.body;

        try {
            const { data } = await service.ChangePassword({ id:_id, current_password,new_password});

            res.status(201).json(data);
        } catch (error) {
            res.status(500).json("Internal server error!");
            
        }
    });


    app.post('/address', UserAuth, async (req,res,next) => {
        
        const { _id } = req.user;


        const { street, postalCode, city,country } = req.body;

        const { data } = await service.AddNewAddress( _id ,{ street, postalCode, city,country});

        res.json(data);

    });
    // Get user profile from stored session
    app.get('/profile', UserAuth ,async (req,res,next) => {

        const { _id } = req.user;

        const { data } = await service.GetProfile({ _id });
        res.json(data);
    });    
     

    app.get('/shoping-details', UserAuth, async (req,res,next) => {
        const { _id } = req.user;
       const { data } = await service.GetShopingDetails(_id);

       return res.json(data);
    });
    
    app.get('/wishlist', UserAuth, async (req,res,next) => {
        const { _id } = req.user;
        const { data } = await service.GetWishList( _id);
        return res.status(200).json(data);
    });

    app.get('/whoami', (req,res,next) => {
        return res.status(200).json({msg: '/customer : I am Customer Service'})
    })

    // Get user profile by params Id
    app.get('/:id', UserAuth ,async (req,res,next) => {
        const _id = req.params.id;
        const { data } = await service.GetProfile({ _id });
        res.json(data);
    });
    // Update user profile
    app.put('/profile', UserAuth ,async (req,res,next) => {
        // const _id = req.params.id;
        try{
            const { _id } = req.user;
            const {username,email,phone,profile} = req.body;
    
            const { data } = await service.UpdateProfile({ _id,profile,username,email,phone});
            res.status(201).json(data);
        }catch{
            res.status(505).json("Internal server error!");
        }
    });
}
