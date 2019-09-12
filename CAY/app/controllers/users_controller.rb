class UsersController < ApplicationController
	
 before_action :set_user, only: [:show, :edit, :update, :destroy]

  # GET /users
  # GET /users.json
  def index
    @users = User.all
	if @users
     #   format.html { redirect_to @user, notice: 'User was successfully created.' }
         render json:{status: 'Success',data: @users}, status: :ok 
      else
      #  format.html { render :new }
	  
	  render json: {status: 'fail',error: @users.errors}, status: :unprocessable_entity
      end
  end

 
 #get profile
 
  def profile
  @user = User.where(id: params[:user_id]).first
	if @user
     
         render json:{code: '201',status: 'Success',data: @user}, status: :ok 
      else
	  
	  render json: {code: '200',status: 'fail',error: 'User ID does not Exists'}, status: :unprocessable_entity
      end
  end
  
  # GET /users/1
  # GET /users/1.json
  #show single user by id
  def show
    @user = User.find(params[:id])
	#@user = User.where(email: params[:id],password: params[:password]).first
	if @user
     #   format.html { redirect_to @user, notice: 'User was successfully created.' }
         render json:{status: 'Success',data: @user}, status: :ok 
      else
      #  format.html { render :new }
	  
	  render json: {status: 'fail',error: @user.errors}, status: :unprocessable_entity
      end
	
  end
  
  #used for login 
  def loginu
  
	@user = User.where(email: params[:email],password: params[:password]).first
	if @user
     
         render json:{code: '201',status: 'Success',data: @user}, status: :ok 
      else
     
	  
	  render json: {code: '200',status: 'fail',error: 'Email and Password does not match'}, status: :unprocessable_entity
      end
	
  end
  
  # forget Password 
  def forget
  
	@user = User.where(email: params[:email]).first
	if @user
	
	
	@num = rand(1..10000)
	@user.update_attributes(:otp => @num)
	
	UserMailer.hello_email(@user).deliver_now
    
         render json:{code: '201',status: 'Success',data: @user, otp: @num}, status: :ok 
      else
      
	  
	  render json: {code: '200',status: 'fail',error: 'Email not valid'}, status: :unprocessable_entity
      end
	
  end
  
  #reset password
  def reset
  @user = User.where(email: params[:email],otp: params[:otp]).first
	if @user
     
	 @pass = params[:password]
	 @user.update_attributes(:password => @pass,:otp =>'')
         render json:{code: '201',status: 'Success',message: 'Password reset Successfully'}, status: :ok 
      else
     
	  
	  render json: {code: '200',status: 'fail',error: 'Email and Otp does not match'}, status: :unprocessable_entity
      end
  
  end
  
  def change_password
  
  @user = User.where(id: params[:user_id],password: params[:oldpassword]).first
	if @user
     
	 @pass = params[:new_password]
	 @user.update_attributes(:password => @pass)
         render json:{code: '201',status: 'Success',message: 'Password Changed Successfully'}, status: :ok 
      else
     
	  
	  render json: {code: '200',status: 'fail',error: 'User id and password does not match'}, status: :unprocessable_entity
      end
  
  end

  # GET /users/new
  def new
    @user = User.new
  end

  # GET /users/1/edit
  def edit
  end

  # POST /users
  # POST /users.json
  # Registration 
   def create
   
    @user = User.new(user_params)

   # respond_to do |format|
      if @user.save
     #   format.html { redirect_to @user, notice: 'User was successfully created.' }
         render json:{code: '201',status: 'Success',data: @user}, status: :created 
      else
      #  format.html { render :new }
	  
	  render json: {code: '200',status: 'fail',error: @user.errors}, status: :unprocessable_entity
      end
    #end
  end

  # PATCH/PUT /users/1
  # PATCH/PUT /users/1.json
  def update
    respond_to do |format|
      if @user.update(user_params)
        format.html { redirect_to @user, notice: 'User was successfully updated.' }
        format.json { render :show, status: :ok, location: @user }
      else
        format.html { render :edit }
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /users/1
  # DELETE /users/1.json
  def destroy
    @user.destroy
    respond_to do |format|
      format.html { redirect_to users_url, notice: 'User was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_user
      @user = User.find(params[:id])
	  
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def user_params
      params.require(:user).permit(:username,:email,:password,:deviceId,:deviceType,:otp)
	   #params.permit(:username,:email,:password,:deviceId,:deviceType,:otp)
    end
	
	
	
	
end
