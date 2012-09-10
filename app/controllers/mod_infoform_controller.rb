class ModInfoformController < ApplicationController

  before_filter :authenticate_company!, :except => :create
  
  def create
    @contact = ModInfoform.new(params[:i])
    @contact.used_component_id = UsedComponent.find_by_uid(params[:uid]).id

    if @contact.save
      render :json => true, :callback => params[:callback]
    else
      render :json => false, :callback => params[:callback]
    end
  end

  def all
    @uc = UsedComponent.all :conditions => { :company_id => current_company.id, :component_id => Component.find_by_uname('infoform').id }
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
  end

  def delete
    @uc = UsedComponent.find params[:contact_id], :conditions => { :company_id => current_company.id, :component_id => Component.find_by_uname('infoform').id }
    ModInfoform.destroy_all({ :used_component_id => @uc.id, :id => params[:ids] }) unless @uc.blank?
    render :json => true
  end

end
