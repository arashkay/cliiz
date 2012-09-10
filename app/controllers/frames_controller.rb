class FramesController < ApplicationController

  before_filter :is_admin, :except => [:get, :list]
  before_filter :authenticate_company!, :except => [:get, :list]

  def index
    @frames = Frame.all :order => '`order` DESC'
  end

  def list
    @frames = Frame.all :conditions => { :is_private => false }, :order => '`order` DESC'
    render :layout => false
  end

  def get
    current_company = Company.new( { :setting => {}, :name => 'Company name' } )
    @frame = Frame.find params[:id]
    components = []
    components << UsedComponent.mock_welcome
    components << UsedComponent.mock_website_importance
    current_company.setting = {
      :logo => '/images/blank-logo.png',
      :menu => [ ['home', '/home', 'Home'], ['about', '/about', 'About'], ['contact', '/contact', 'Contact'] ],
      :facebookpage => 'cliiz.com',
      :display_name => 'Your Site Name'
    }
    components << UsedComponent.mock_map_contact
    components << UsedComponent.mock_map(current_company)

    render :inline => Generator.new.page( 'home', current_company, @frame, components, '').to_html
  end

  def new
    @last_frame = Frame.first :order => '`order` DESC'
    @frame = Frame.new(:order => @last_frame.order+1)
  end

  def edit
    @frame = Frame.find(params[:id])
  end

  def create
    @frame = Frame.new(params[:frame])
    if @frame.save
      redirect_to '/frames', :notice => 'Frame was successfully created.'
    else
      render :action => "new"
    end
  end

  def update
    @frame = Frame.find(params[:id])
    if @frame.update_attributes(params[:frame])
      render :action => 'edit', :notice => 'Frame was successfully updated.'
    else
      render :action => "edit"
    end
  end

  def destroy
    @frame = Frame.find params[:id]
    @frame.destroy
    redirect_to frames_url
  end

end
