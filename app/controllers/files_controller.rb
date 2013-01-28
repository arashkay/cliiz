class FilesController < ApplicationController
  
  before_filter :authenticate_company!, :except => [:is_new, :not_registered, :current]
  before_filter :parent_folder
  
  def show
    params[:folder_id] = params[:id]
    parent_folder
    explore
    respond_to do |format|
      format.html { render :index }
      format.json { render(:json => { :files => @files, :folders => @folders, :parent => @parent }, :methods => :thumb_url ) }
    end
  end

  def index
    folder = current_company.folder( params[:folder] )
    @files = Image.where( :folder_id => folder.id )
    respond_to do |format|
      format.json { render :json => @files.to_json( :methods => :thumb_url ) }
    end
  end

  def new
    @file = Image.new
  end

  def create
    refresh_site!
    folder = current_company.folder( params[:folder] )
    @files = []
    params[:files].each do |file|
      next if file.blank?
      image = Image.new :entity => file, :folder_id => folder.id
      image.company = current_company
      image.save
      gallery_image = ModGallery.new({ :image => image })
      gallery_image.used_component_id = current_company.gallery.id
      gallery_image.save
      @files << image
    end
    render :json => @files.to_json( :methods => :thumb_url )
  end

  def edit
    @file = Image.find params[:id]
  end

  def update
    @file = Image.find params[:id]
    if @file.update_attributes(params[:file])
      redirect_to "/panel/files/#{params[:file][:folder_id]}"
    else
      render :edit
    end
  end

  def new_folder
    @folder = Folder.new
  end

  def create_folder
    @folder = Folder.new params[:folder]
    @folder.company = current_company
    @folder.save
    redirect_to "/panel/files/#{@folder.folder_id}"
  end

  def destroy
    Image.destroy_all :id => params[:ids], :company_id => current_company.id unless params[:ids].blank?
    Folder.destroy_all :id => params[:folders], :company_id => current_company.id unless params[:folders].blank?
    render :json => true
  end

  def move
    if(!params[:folder].blank?)
      @f = Folder.find params[:folder], :conditions => { :company_id => current_company.id }
    elsif(!params[:file].blank?)
      @f = Image.find params[:file], :conditions => { :company_id => current_company.id }
    end
    @f.folder_id = @parent.id
    @f.save
    render :json => true
  end

  private
  
  def explore
    conditions = { :company_id => current_company.id }
    conditions[:folder_id] = @parent.blank? ? nil : @parent.id
    @files = Image.find :all, :conditions => conditions
    @folders = Folder.find :all, :conditions => conditions
  end

  def parent_folder
    @parent = Folder.find params[:folder_id] unless params[:folder_id].blank?
    @parent = Folder.new( { :folder => Folder.new }) if @parent.blank?
  end

end
