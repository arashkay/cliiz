CliizCom::Application.routes.draw do

  devise_for :companies

  scope '/coreapi' do
    get '/javascripts/config.js' => "general#js_config"
    
    match '/modules/submit_form' => 'mod_infoform#create'
    match '/modules/:action(/:id)' => 'modules'

    post '/menu' => 'companies#menu'
    post '/setting' => 'companies#update_profile'
    #get '/companies/all' => 'companies#all'
    #post '/companies/current' => "companies#current"
    #post '/companies/layout' => "companies#frame"
    post '/companies/temp_layout' => "companies#temp_frame"
    post '/companies/enable_package' => "companies#enable_package"
    post '/companies/disable_package' => "companies#disable_package"
    post '/restore' => "companies#reset_temp_frame"
    #post '/used_components/multiple' => "used_components#multiple"
    post '/used_components/update' => "used_components#update"

    #resources :payments
    resources :components, :only => [] do 
      collection do 
        post 'list_addables'
        post 'blocks'
        post 'block_for'
      end
    end
    resources :blogging, :controller => :mod_blog do
      delete '/delete', :action => :delete
      post '/restore', :action => :restore
      collection do
        get :archive
      end
    end
    resources :files
  end

  match '/panel' => 'general#panel'
  def sites_routes(action='render_page')
    match '/' => "sites##{action}", :page => nil
    match '/:page' => "sites##{action}"
    match '/:page/:id' => "sites##{action}"
    match '/:page/:id/:name.html' => "sites##{action}"
  end

  #match '/designers/how_to_design' => 'general#how_to_design'
  #match '/payment/notifier' => 'general#notify'
  scope '/panel', {:edit => true} do
    scope '/edit' do
      sites_routes('modify')
    end
    #match '/update_profile' => 'companies#update_profile'
    #match '/first_edit_done' => 'companies#first_edit_done'
    #match '/check_domain' => 'general#check_domain'
    #match '/save_domain' => 'general#save_domain'
    
    #match '/payment/cancel' => 'general#cancel'
    #match '/payment/success' => 'general#success'
    
    #match '/contact_books' => 'mod_infoform#all'
    #match '/contact_books/:id' => 'mod_infoform#index'
    #match '/contact/:book/:id' => 'mod_infoform#show'

    #match '/gallery.json' => 'mod_gallery#all'
    #post '/gallery/create' => 'mod_gallery#create'
    #post '/gallery/update' => 'mod_gallery#update'
    #post '/gallery/delete' => 'mod_gallery#delete'
    
    #resources :listing, :controller => :mod_list do
    #  delete '/delete', :action => :delete
    #end
    
    #get '/files/new_folder/:folder_id' => 'files#new_folder'
    #get '/files/new_folder' => 'files#new_folder'
    #post '/files/create_folder' => 'files#create_folder'
    #get '/files/new/:folder_id' => 'files#new'
    #post '/files/move' => 'files#move'
    #post '/files.json' => 'files#index', :format => :json
    #post '/files/:id.json' => 'files#show', :format => :json
    #resources :files do
    #  delete '/delete', :action => :destroy
    #  post '/folder', :action => :create_folder
    #end
    
    #resources :contacts, :controller => :mod_infoform do
    #  delete '/delete', :action => :delete
    #end
    #get '/:action', :controller => 'general'
  end

  if 'development' != Rails.env
    constraints( { :host => /[^webuilder.com.au]/ } ) do
      sites_routes
    end
  else
    constraints( { :host => /[^cliiz.com.au]/ } ) do
      sites_routes
    end
  end
 
  #constraints( { :subdomain => /[^(www)]/ } ) do
  #  sites_routes
  #end

  post '/companies/is_new'          => "companies#is_new"
  post '/companies/not_registered'  => "companies#not_registered"
  
  #get '/plans(.:format)' => "general#plans"
  #resources :designers do
  #  collection do 
  #    post 'upload'
  #  end
  #end

  # SITE ROUTES
  get '/templates/:id/home.html' => "frames#get"
  get '/templates/free' => "frames#list"
  resources :frames
  resources :used_components
  resources :components do 
    collection do 
      get 'reinit'
    end
  end

  root :to => "general#index"
 
end
