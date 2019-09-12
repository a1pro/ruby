class HomeController < ApplicationController
	skip_before_filter :check_token
	skip_before_action :authorize
	layout false
	#require 'net/http'
	
  def index
  end
  
  def new
    @postuniversal = Postuniversal.new
	end
  
  def vault_new
	  @vaultpost = Vaultpost.new
  end
  
  def logina
    
	
  
	@user = User.where(email: params[:email],password: params[:password],username: params[:username]).first
	if @user
     #   format.html { redirect_to @user, notice: 'User was successfully created.' }
	  session[:user_id] = @user.id
      session[:user_name] = @user.username
         #render json:{status: 'Success',data: @user}, status: :ok 
		
		 #render :layout => 'home'
		 #render :header
		 redirect_to '/universalpost'
		 
      else
      
	  redirect_to '/admin', notice: "Email and Password does not match."
	  
	  
      end
  end
  
  def universal_post
  
 @postuniversal = Postuniversal.new(postuniversal_params)
 #@cols =  Postuniversal.all
 #@cols = Postuniversal.column_names
   #render json: {status: 'fail',error: @cols}, status: :unprocessable_entity
  
   if @postuniversal.save
   
	 #render :header, :notice => "Post Created"
	 redirect_to '/universalpost', notice: "Post Created"
	#render json:{status: 'Success',data: @postuniversal}, status: :created
		
   else
      
	   redirect_to '/universalpost', notice: "Does not create Post"
	  #render json: {status: 'fail',error: @postuniversal.errors}, status: :unprocessable_entity
	
   end
  
  end
  
  def view_vault
   if (session[:user_name] != "admin") then
		redirect_to '/admin', notice: "Unauthorized Access"
	else
   render :vault
   end
  end
  
  def view_setting
   if (session[:user_name] != "admin") then
		redirect_to '/admin', notice: "Unauthorized Access"
	else
   render :setting
   end
  end
  
  
  def view_alluniversalposts
  
  if (session[:user_name] != "admin") then
		redirect_to '/admin', notice: "Unauthorized Access"
	else
	
	#Postuniversal.delete_all
	@shedule_posts = Postuniversal.where(status: 'SCHEDULE').count
	@alluniversal_posts = Postuniversal.all.order('id desc')
	#render json: {status: 'succes',error: @alluniversal_posts}, status: :ok
	render :alluniversal
	
		
	end
	
  end
  
  
  def tagfilter
  
   if (session[:user_name] != "admin") then
	   redirect_to '/admin', notice: "Unauthorized Access"
	else
	
	if (params[:tag] === "All")
	
	@shedule_posts = Postuniversal.where(status: 'SCHEDULE').count
	
	@alluniversal_posts = Postuniversal.all;
	
	render :alluniversal
	
	else
	
	@shedule_posts = Postuniversal.where(status: 'SCHEDULE',tag: params[:tag]).count
	
   @alluniversal_posts = Postuniversal.where(tag: params[:tag]);
	
	render :alluniversal
	#render json: {status: 'success',error: @alluniversal_posts}
	
		
	end
   end
  
  
  end
  
  
  
  
  def updatestatus
  
  @post_universal = Postuniversal.where(id: params[:id]).first
  
  @post_universal.update_attributes(:status => params[:status])
  
  render json: {status: 'succes',error: @post_universal}
  
  
  end
  
  
  def view_universalposts
  
  if (session[:user_name] != "admin") then
		redirect_to '/admin', notice: "Unauthorized Access"
	else
	
	
	@universal_posts = Postuniversal.where(status: 'SCHEDULE')
	
	render :universal
	#render json: {status: 'fail',error: @universal_posts}, status: :unprocessable_entity
		
	end
	
  end
  
  
  def universalpost_view
  
  if (session[:user_name] != "admin") then
		redirect_to '/admin', notice: "Unauthorized Access"
	else
	
	#@universal_posts = Postuniversal.where(status: 'SCHEDULE')
	render :header
	
	end
	
  end
  
  
  def vault_post
  
  @vaultpost = Vaultpost.new(vaultpost_params)
 #@cols =  Postuniversal.all
 #@cols = Postuniversal.column_names
   #render json: {status: 'fail',error: @cols}, status: :unprocessable_entity
  
   if @vaultpost.save
    
	redirect_to '/vaultpost', notice: "Vault Post Created"
	
		
   else
      redirect_to '/vaultpost', notice: "Does not create Post"
	  #render json: {status: 'fail',error: @vaultpost.errors}, status: :unprocessable_entity
	
   end
  
  end
  
  
  
  def post_setting
  
  @postsetting = Postsetting.new(setting_params)
 
  
   if @postsetting.save
    
	redirect_to '/postsetting', notice: "Banner added"
	
		
   else
      redirect_to '/postsetting', notice: "Does not add Banner"
	   
	
   end
  
  end
  
  
  def setting_params
  
  params.permit(:posttype,:author,:attachment,:attachmenttype,:title)
	   #params.permit(:username,:email,:password,:deviceId,:deviceType,:otp)
    end
  
  
  
  def vaultpost_params
  
  params.permit(:tag,:url,:attachment,:attachmenttype,:title)
	   #params.permit(:username,:email,:password,:deviceId,:deviceType,:otp)
    end
  
  
  def postuniversal_params
  
  params.permit(:tag,:url,:attachment,:attachmenttype,:title,:status,:source)
	   #params.permit(:username,:email,:password,:deviceId,:deviceType,:otp)
    end
  
  def featured_params
  params.permit(:key,:title,:value)
  end
  
  def get_featured
  @get = FeaturedVideo.all
  render json:{status: 'Success',data: @get}, status: :ok
  end
  def featured_create
  
  @featured = FeaturedVideo.where(key: params[:key]).first;
  @featured.update_attributes(:value => params[:url]);
  @featured.update_attributes(:title => params[:title]);
 #@cols = FeaturedVideo.column_names
   #render json: {status: 'fail',error: @cols}, status: :unprocessable_entity
  
  # if @featured.save
   
   render json:{status: 'Success',data: @featured}, status: :ok
  
  # end
  
  end
  
  
  def destroy
  	session[:user_id] = nil
	session[:user_name] = nil
  	redirect_to '/admin', notice: "User logged out "
 # render :index , notice: "User logged out "
  end
  
  def del_universal_post
  
  @dpost = Postuniversal.where(id: params[:id]).first
    @dpost.destroy
	redirect_to '/universalpostmanger', notice: "Post is deleted"
  #render json: {status: 'successfully',error: @dpost}, status: :unprocessable_entity
  
  end
  
  def featured_post
  
  if (session[:user_name] != "admin") then
		redirect_to '/admin', notice: "Unauthorized Access"
	else
	
	
	@alluniversal_posts = Postuniversal.where(attachmenttype: 'Video').all.order('id desc')
	@allvault_posts = Vaultpost.where(attachmenttype: 'Video').all.order('id desc')
	@featured_post = FeaturedVideo.all
	render :featured
	#render json: {status: 'fail',universal: @alluniversal_posts,vault: @allvault_posts }, status: :unprocessable_entity
		
	end
	
  end
  
end
