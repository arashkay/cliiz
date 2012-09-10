class ModBlogController < ApplicationController

  before_filter :authenticate_company!, :except => :create
  
  def create
    @post = ModBlog.new(params[:post])
    @blog = current_company.blog
    @post.used_component_id = @blog.id unless @blog.blank?
    if @post.save
      redirect_to '/panel/blogging'
    elsif @blog.blank?
      redirect_to '/panel/blogging'
    else
      render :new
    end
  end

  def new
    @post = ModBlog.new :publish_date => Date.today
  end
  
  def index
    @blog = current_company.blog
    @posts = ModBlog.all :conditions => { :used_component_id => @blog.id, :trashed => false }, :order => 'created_at DESC' unless @blog.blank?
  end

  def archive
    @blog = current_company.blog
    @posts = ModBlog.all :conditions => { :used_component_id => @blog.id, :trashed => true }, :order => 'created_at DESC' unless @blog.blank?
    render :action => :index
  end

  def edit
    @post = ModBlog.find(params[:id], :conditions => { :used_component_id => current_company.blog.id })
    render :new
  end

  def update
    @post = ModBlog.first(:conditions => { :id => params[:id], :used_component_id => current_company.blog.id })
    if @post.blank? || @post.update_attributes(params[:post])
      redirect_to '/panel/blogging'
    else
      render :new
    end
  end

  def delete
    @blog = current_company.blog
    ModBlog.update_all( 'trashed = true', { :used_component_id => @blog.id, :id => params[:ids] }) unless @blog.blank?
    render :json => true
  end

  def restore
    @blog = current_company.blog
    ModBlog.update_all( 'trashed = false', { :used_component_id => @blog.id, :id => params[:ids] }) unless @blog.blank?
    render :json => true
  end

end
