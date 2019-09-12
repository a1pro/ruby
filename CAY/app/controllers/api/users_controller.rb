class Api::UsersController < ApplicationController
	before_action :set_user, only: [:show, :edit, :update, :destroy]
	
	def new
    @user = User.new
  end
  
  #create User
 def create
 @user = User.new(user_params)

      if @user.save
   
         render json:@user, status: :created 
      else
     
	  render json: @user.errors, status: :unprocessable_entity
      end
 end
 
 def set_user
      @user = User.find(params[:id])
    end
	
 def user_params
      #params.require(:user).permit(:name, :age)
	   params.require(:user).permit(:username,:email,:password,:deviceId,:deviceType,:otp)
    end
end 

