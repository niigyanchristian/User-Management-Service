const { CustomerRepository } = require("../database");
const { FormateData, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } = require('../utils');

// All Business logic will be here
class CustomerService {

    constructor(){
        this.repository = new CustomerRepository();
    }

    async SignIn(userInputs){

        const { email, password } = userInputs;
        
        const existingCustomer = await this.repository.FindCustomer({ email});

        if(existingCustomer){
            
            const validPassword = await ValidatePassword(password, existingCustomer.password, existingCustomer.salt);
            if(validPassword){
                const token = await GenerateSignature({ email: existingCustomer.email, _id: existingCustomer._id});
                return FormateData({id: existingCustomer._id, token,email:existingCustomer.email,username:existingCustomer.username,phone:existingCustomer.phone,profile:existingCustomer.profile});
            }else{
                return {data:"Wrong crendentials!"}
            }
        }

        return FormateData(null);
    }

    async SignUp(userInputs){
        
        const { email, password, phone, username, profile } = userInputs;
    
        // create salt
        let salt = await GenerateSalt();
        
        let userPassword = await GeneratePassword(password, salt);
        
        const existingCustomer = await this.repository.CreateCustomer({ email, password: userPassword, phone, salt,username, profile});
        
        
        const token = await GenerateSignature({ email: email, _id: existingCustomer._id});
        return FormateData({id: existingCustomer._id, token,email:existingCustomer.email,username:existingCustomer.username,phone:existingCustomer.phone,profile:existingCustomer.profile });

    }

    async ChangePassword(userInputs){
        
        const { id, current_password,new_password } = userInputs;

        const existingCustomer = await this.repository.FindCustomerById({ id});

        if(existingCustomer){
            
            const validPassword = await ValidatePassword(current_password, existingCustomer.password, existingCustomer.salt);
            if(validPassword){
                // create salt
                let salt = await GenerateSalt();
                
                let userPassword = await GeneratePassword(new_password, salt);

                const newUserInfo = await this.repository.ChangeUserPassword({password:userPassword,salt,_id:existingCustomer._id});
        
        
                const token = await GenerateSignature({ email: newUserInfo.email, _id: newUserInfo._id});
                return FormateData({id: newUserInfo._id, token,email:newUserInfo.email,username:newUserInfo.username,phone:newUserInfo.phone,profile:newUserInfo.profile });
            }else{
                return FormateData('Password mismatched!');
            }
        }else{
            return FormateData("User doesn't exist!");
        }
    }

    async DeleteCustomer(userInputs){
        
        const { _id } = userInputs;

        
        const existingCustomer = await this.repository.DeleteCustomer({ _id});
        
        // const token = await GenerateSignature({ email: existingCustomer.email, _id: existingCustomer._id});
        if(existingCustomer){
            return FormateData({id: existingCustomer._id});
        }else{
            return FormateData({response:'No user found!'});
        }

    }

    async AddNewAddress(_id,userInputs){
        
        const { street, postalCode, city,country} = userInputs;
    
        const addressResult = await this.repository.CreateAddress({ _id, street, postalCode, city,country})

        return FormateData(addressResult);
    }

    async GetProfile(id){

        const existingCustomer = await this.repository.FindCustomerById({id});
        return FormateData(existingCustomer);
    }
    async UpdateProfile({_id,profile,username,email,phone}){

        const existingCustomer = await this.repository.UpdateCustomer({_id,profile,username,email,phone});
        const token = await GenerateSignature({ email: existingCustomer.email, _id: existingCustomer._id});
        return FormateData({id: existingCustomer._id, token,email:existingCustomer.email,username:existingCustomer.username,phone:existingCustomer.phone,profile:existingCustomer.profile});
    }

    async ChangeOwnership(userId,newRole){
        const customer = await this.repository.ChangeOwnership(userId,newRole);

        return FormateData(customer);
    }

    async GetShopingDetails(id){

        const existingCustomer = (await this.repository.FindCustomerById({id})).toObject();

        if(existingCustomer){
            delete existingCustomer.profile;
            delete existingCustomer.salt;
            delete existingCustomer.password;
            
           return FormateData(existingCustomer);
        }       
        return FormateData({ msg: 'Error'});
    }

    async GetWishList(customerId){
        const wishListItems = await this.repository.Wishlist(customerId);
        return FormateData(wishListItems);
    }

    async AddToWishlist(customerId, product){
         const wishlistResult = await this.repository.AddWishlistItem(customerId, product);        
        return FormateData(wishlistResult);
    }

    async ManageCart(customerId, product, isRemove){
        console.log("I'm adding to cart!")
        const cartResult = await this.repository.AddCartItem(customerId, product, isRemove);        
       return FormateData(cartResult);
    }

    async ManageOrder(customerId, order){
        const orderResult = await this.repository.AddOrderToProfile(customerId, order);
        return FormateData(orderResult);
    }

    async SubscribeEvents(payload){
 
        console.log('Triggering.... Customer Events')

        payload = JSON.parse(payload)

        const { event, data } =  payload;

        const { userId, product, order, qty,shop_id } = data;

        switch(event){
            case 'ADD_TO_WISHLIST':
            case 'REMOVE_FROM_WISHLIST':
                this.AddToWishlist(userId,product)
                break;
            case 'ADD_TO_CART':
                this.ManageCart(userId,product, false);
                break;
            case 'REMOVE_FROM_CART':
                this.ManageCart(userId,product, true);
                break;
            case 'CREATE_ORDER':
                this.ManageOrder(userId,order);
                break;
            case 'CHANGE_USER_TO_OWNER':
                this.ChangeOwnership(data.owner_id,data.newRole);
                break;
            default:
                break;
        }
    }
}

module.exports = CustomerService;
