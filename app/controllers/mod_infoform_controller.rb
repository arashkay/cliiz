class ModInfoformController < ApplicationController

  before_filter :authenticate_company!, :except => :create
  
  def create
    uc = UsedComponent.find_by_uid(params[:uid])
    @contact = ModInfoform.new
    @contact.used_component_id = uc.id
    @contact.fields = params[:i]

    if @contact.save
      render :json => true, :callback => params[:callback]
    else
      render :json => false, :callback => params[:callback]
    end
  end

  def all
    @uc = UsedComponent.where( { :company_id => current_company.id, :component_id => Component.find_by_uname('infoform').id } ).includes(:mod_infoform)
    render :json => @uc, :include => :mod_infoform, :only => [:uid, :setting]
  end
  
  def index
    @uc = UsedComponent.find params[:id], :conditions => { :company_id => current_company.id, :component_id => Component.find_by_uname('infoform').id }
    @fields = (@uc.setting[:fields]-['message'])[0..2]
    @contacts = ModInfoform.all :conditions => { :used_component_id => @uc.id }, :select => @fields+[:id]
  end

  def show
    @uc = UsedComponent.find params[:book], :conditions => { :company_id => current_company.id, :component_id => Component.find_by_uname('infoform').id }
    @fields = @uc.setting[:fields]
    @contact = ModInfoform.find params[:id], :conditions => { :used_component_id => @uc.id }, :select => @fields+[:id]
    @contact.see!
  end

  def destroy
    @uc_ids = UsedComponent.where( { :company_id => current_company.id, :component_id => Component.find_by_uname('infoform').id } ).map(&:id)
    ModInfoform.destroy_all({ :used_component_id => @uc_ids, :id => params[:id] }) unless @uc_ids.blank?
    render :json => true
  end

end
