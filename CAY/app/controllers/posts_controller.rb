class PostsController < ApplicationController
	
 before_action :set_user, only: [:show, :edit, :update, :destroy]

  

 #
 # API
 # GET Universal Posts
 #
  def universal_posts
  #@delete = Postuniversal.delete_all
  @alluniversal_posts = Postuniversal.all.order('id desc')
  @featured = FeaturedVideo.where(key: 'featured_universal').first;
  render json: {code: '201',status: 'success',message: 'Successfully' ,featured: @featured,data: @alluniversal_posts}, status: :ok
  end
  
  
  #
 # API
 # GET Vault Posts
 #
  def vault_posts
  #@delete = Vaultpost.delete_all
  @allvault_posts = Vaultpost.all.order('id desc')
  @featured = FeaturedVideo.where(key: 'featured_vault').first;
  render json: {code: '201',status: 'success',message: 'Successfully' ,featured: @featured,data: @allvault_posts}, status: :ok
  end
  
  
  
  def all_videos
  
  @user = User.where(id: params[:user_id]).first
	if @user
  @alluniversal_posts = Postuniversal.where(attachmenttype: 'Video').all.order('id desc')
  @allvault_posts = Vaultpost.where(attachmenttype: 'Video').all.order('id desc')
  
  render json: {code: '201',status: 'success',message: 'Successfully' ,Universal: @alluniversal_posts,vault: @allvault_posts}, status: :ok
  
  else
	  
	  render json: {code: '200',status: 'fail',error: 'User ID does not Exists'}, status: :unprocessable_entity
	end
  
  end
  
  
  def add_victory_post
    @victory_post = UserPost.new(victory_params)
  
  @user = User.where(id: params[:userid]).first
	if @user
  #render json: {code: '201',status: 'success',message: 'Successfully' ,user: @user}, status: :ok
  
  ##########
  
  if @victory_post.save
    
	
	render json: {code: '201',status: 'success',message: 'Successfully' ,data: @victory_post}, status: :ok
		
   else
      
	  render json: {code: '200',status: @victory_post.errors,error: 'Something Wrong!'}, status: :unprocessable_entity 
	
   end
  
  ##########
  else
	  
	  render json: {code: '200',status: 'fail',error: 'User ID does not Exists'}, status: :unprocessable_entity
	end
  
  end
  
  
  def victory_params
  
  params.permit(:title,:userid,:description,:attachment,:victory_type)
	   #params.permit(:username,:email,:password,:deviceId,:deviceType,:otp)
    end
	
	
	
	def get_victory_post
	 #@delete = UserPost.delete_all
	@user = User.where(id: params[:userid]).first
	if @user
	
	#@victory_post = UserPost.where(userid: params[:userid])
	
	#@victory_post = UserPost.all
	

	@victory_post= UserPost.joins(:users).select("user_posts.*, users.username")
	
	@user_cols = User.column_names
	
	render json: {code: '201',status: 'success',message: 'Successfully',data: @victory_post}, status: :ok
	
	else
	render json: {code: '200',status: 'fail',error: 'User ID does not Exists'}, status: :unprocessable_entity
	end
	
	end
	
end
