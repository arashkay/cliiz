class ModGalleryController < ApplicationController

  before_filter :authenticate_company!
  
  def create
    @image = ModGallery.new(params[:image])
    @image.used_component_id = current_company.gallery.id
    @image.save
    render :json => [@image], :methods => :thumb_url
  end

  def update
    @image = ModGallery.find_by_id_and_used_component_id params[:image][:id], current_company.gallery.id 
    @image.update_attributes params[:image]
    render :json => [@image], :methods => :thumb_url
  end

  def all
    render :json => ModGallery.all(
      :conditions => { 
        :used_component_id => current_company.gallery.id,
        :parent_id => params[:album]
      }, 
      :joins => 'LEFT JOIN images ON image_id = images.id',
      :include => :image
    ), :methods => :thumb_url 
  end
  
  def delete
    @image = ModGallery.find_by_id_and_used_component_id params[:image][:id], current_company.gallery.id 
    @image.destroy
    render :json => true
  end

end
