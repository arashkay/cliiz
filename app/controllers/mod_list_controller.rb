class ModListController < ApplicationController

  before_filter :authenticate_company!
  
  def create
    @item = ModList.new(params[:item])
    @listing = current_company.listing
    @item.used_component_id = @listing.id unless @listing.blank?
    if @item.save
      refresh_site!
      redirect_to '/panel/listing'
    elsif @listing.blank?
      redirect_to '/panel/listing', :error => 'Please activate your listing in Website Builder before adding items here.'
    else
      render :new
    end
  end

  def new
    @item = ModList.new
  end
  
  def index
    @listing = current_company.listing
    @items = ModList.where({ :used_component_id => current_company.listing.id }).order('created_at DESC') unless @listing.blank?
  end

  def edit
    @item = ModList.find(params[:id], :conditions => { :used_component_id => current_company.listing.id })
    render :new
  end

  def update
    @item = ModList.first(:conditions => { :id => params[:id], :used_component_id => current_company.listing.id })
    if @item.blank? || @item.update_attributes(params[:item])
      refresh_site!
      redirect_to '/panel/listing'
    else
      render :new
    end
  end

  def delete
    @listing = current_company.listing
    ModList.destroy_all( { :used_component_id => @listing.id, :id => params[:ids] } ) unless @listing.blank?
    refresh_site!
    render :json => true
  end

end
