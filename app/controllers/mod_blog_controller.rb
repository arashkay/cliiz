class ModBlogController < ApplicationController

  before_filter :authenticate_company!
  
  def create
    @post = ModBlog.new(params[:post])
    @blog = current_company.blog
    @post.used_component_id = @blog.id unless @blog.blank?
    if @post.save
      refresh_site!
      render :json => @post.to_json( :methods => [:thumb, :human_publish_date] )
    elsif @blog.blank?
      render :json => CLIIZ::ERRORS::ENABLE_PACKAGE
    else
      render :json => @post.errors
    end
  end

  def new
    @post = ModBlog.new :publish_date => Date.today
  end
  
  def index
    @blog = current_company.blog
    @posts = ModBlog.all :conditions => { :used_component_id => @blog.id, :trashed => false }, :order => 'created_at DESC' unless @blog.blank?
    render :json => @posts.to_json( :methods => :thumb )
  end

  def archive
    @blog = current_company.blog
    @posts = ModBlog.all :conditions => { :used_component_id => @blog.id, :trashed => true }, :order => 'created_at DESC' unless @blog.blank?
    render :action => :index
  end

  def edit
    @post = ModBlog.find(params[:id], :conditions => { :used_component_id => current_company.blog.id })
    render :json => @post.to_json( :methods => [:thumb, :human_publish_date] )
  end

  def update
    @post = ModBlog.first(:conditions => { :id => params[:id], :used_component_id => current_company.blog.id })
    if @post.blank? || @post.update_attributes(params[:post])
      refresh_site!
      render :json => @post.to_json( :methods => [:thumb, :human_publish_date] )
    else
      render :json => @post.errors
    end
  end

  def delete
    @blog = current_company.blog
    ModBlog.update_all( 'trashed = true', { :used_component_id => @blog.id, :id => params[:ids] }) unless @blog.blank?
    refresh_site!
    render :json => true
  end

  def restore
    @blog = current_company.blog
    ModBlog.update_all( 'trashed = false', { :used_component_id => @blog.id, :id => params[:ids] }) unless @blog.blank?
    refresh_site!
    render :json => true
  end

end
