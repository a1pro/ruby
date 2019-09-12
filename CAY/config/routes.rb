Rails.application.routes.draw do
	
  #get 'home/index'
  get 'admin' => 'home#index'
  get 'logout' => 'home#destroy'
  get 'vaultpost' => 'home#view_vault'
  get 'universalpost' => 'home#universalpost_view'
  get 'universalpostmanger' => 'home#view_universalposts'
  get 'postsetting' => 'home#setting'
  get 'alluniversalpost' => 'home#view_alluniversalposts'
  get 'featuredpost' => 'home#featured_post'
  get 'api/universal_posts' => 'posts#universal_posts'
  get 'api/vault_posts' => 'posts#vault_posts'
  post 'api/featured' => 'home#featured_create'
  get 'api/getfeatured' => 'home#get_featured'
  post 'api/allvideos' => 'posts#all_videos'
  post 'api/add_victorypost' => 'posts#add_victory_post'
  post 'api/get_victorypost' => 'posts#get_victory_post'
  resources :users
	post 'users/loginu'
	post 'home/logina'
	post 'home/tagfilter' => 'home#tagfilter'
	post 'home/universal_post' => 'home#universal_post'
	post 'home/updatestatus' => 'home#updatestatus'
	post 'home/vault_post' => 'home#vault_post'
	post 'home/del_universal_post' => 'home#del_universal_post'
	post 'home/addbanner' => 'home#post_setting'
	post 'users/forget'
	post 'users/profile'
	post 'users/reset'
	post 'users/change_password'
	


  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
