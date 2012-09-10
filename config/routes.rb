CliizCom::Application.routes.draw do

  def sites_routes(action='page')
    match '/' => "sites##{action}", :page => 'home'
    match '/index' => "sites##{action}", :page => 'home'
    match '/:page' => "sites##{action}"
    match '/blog/:id' => "sites##{action}", :page => 'blog'
    match '/blog/:id/:name.html' => "sites##{action}", :page => 'blog'
    match '/gallery' => "sites##{action}", :page => 'gallery'
    match '/gallery/:id' => "sites##{action}", :page => 'gallery'
  end

  match '/designers/how_to_design' => 'general#how_to_design'
  match '/payment/notifier' => 'general#notify'
  match '/panel' => 'general#panel'
  scope '/panel' do
    match '/profile' => 'companies#profile'
    match '/update_profile' => 'companies#update_profile'
    match '/first_edit_done' => 'companies#first_edit_done'
    match '/check_domain' => 'general#check_domain'
    match '/save_domain' => 'general#save_domain'
    match '/payment/cancel' => 'general#cancel'
    match '/payment/success' => 'general#success'
    match '/contact_books' => 'mod_infoform#all'
    match '/contact_books/:id' => 'mod_infoform#index'
    match '/contact/:book/:id' => 'mod_infoform#show'
    match '/gallery.json' => 'mod_gallery#all'
    post '/gallery/create' => 'mod_gallery#create'
    post '/gallery/update' => 'mod_gallery#update'
    post '/gallery/delete' => 'mod_gallery#delete'
    resources :blogging, :controller => :mod_blog do
      delete '/delete', :action => :delete
      post '/restore', :action => :restore
      collection do
        get :archive
      end
    end
    get '/files/new_folder/:folder_id' => 'files#new_folder'
    get '/files/new_folder' => 'files#new_folder'
    post '/files/create_folder' => 'files#create_folder'
    get '/files/new/:folder_id' => 'files#new'
    post '/files/move' => 'files#move'
    post '/files.json' => 'files#index', :format => :json
    post '/files/:id.json' => 'files#show', :format => :json
    resources :files do
      delete '/delete', :action => :destroy
      post '/folder', :action => :create_folder
    end
    resources :contacts, :controller => :mod_infoform do
      delete '/delete', :action => :delete
    end
    scope '/edit' do
      sites_routes('modify')
    end
    get '/:action', :controller => 'general'
  end

  unless Rails.env=='development'
    constraints( { :domain => /[^cliiz.com]/ } ) do
      sites_routes
    end
  end
 
  constraints( { :subdomain => /[^(www)]/ } ) do
    sites_routes
  end
  
  match '/modules/submit_form' => 'mod_infoform#create'
  match '/modules/:action(/:id)' => 'modules'

  get '/companies/all' => 'companies#all'
  post '/companies/current' => "companies#current"
  post '/companies/is_new' => "companies#is_new"
  post '/companies/not_registered' => "companies#not_registered"
  post '/companies/layout' => "companies#frame"
  post '/companies/temp_layout' => "companies#temp_frame"
  post '/companies/enable_package' => "companies#enable_package"
  post '/companies/disable_package' => "companies#disable_package"
  post '/companies/reset_temp_layout' => "companies#reset_temp_frame"
  
  post '/used_components/multiple' => "used_components#multiple"
  post '/used_components/update' => "used_components#update"

  get '/templates/:id/home.html' => "frames#get"
  get '/templates/free' => "frames#list"
  get '/javascripts/config.js' => "general#js_config"

  get '/plans(.:format)' => "general#plans"
  resources :frames
  resources :payments
  resources :components do 
    collection do 
      get 'reinit'
      post 'list_addables'
      post 'blocks'
      post 'block_for'
    end
  end

  resources :used_components
  resources :designers do
    collection do 
      post 'upload'
    end
  end
  devise_for :companies

  root :to => "general#index"
 

  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
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

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => 'welcome#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'
end
