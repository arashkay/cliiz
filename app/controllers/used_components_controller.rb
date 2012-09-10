class UsedComponentsController < ApplicationController
  
  before_filter :authenticate_company!

  def update
    order = {}
    ucs = []
    @company = current_company
    if( !@company.setting[:temp_frame_id].blank? && @company.frame_id!=@company.setting[:temp_frame_id] )
      @company.frame_id = @company.setting[:temp_frame_id]
      @company.setting[:temp_frame_id] = nil
      @company.save
    end
    UsedComponent.delete_all :company_id => current_company.id, :uid => params[:removed] unless params[:removed].blank?
  
    (params[:modules]||[]).each do |k,m|
      c = Component.find_by_uname m[:component][:uname]
      return if c.blank?
      order[m[:page]] = 0 unless order.has_key? m[:page]
      order[m[:page]] += 1
      uc = UsedComponent.first :conditions => { :company_id => current_company.id, :uid => m[:uid] } unless m[:uid].blank?
      uc = UsedComponent.new({ :company_id => current_company.id, :component_id => c.id}) if uc.blank?
      uc.page = m[:page]
      uc.partition = m[:partition]
      uc.ordering = order[m[:page]]
      uc.setting = m[:setting]
      uc.save
      ucs << uc
    end
    render :json => true
  end

  def multiple
    order = {}
    ucs = []
    UsedComponent.destroy_all :company_id => current_company.id
    params[:modules].each do |k,m|
      c = Component.find_by_uname m[:type]
      return if c.blank?
      order[m[:page]] = 0 unless order.has_key? m[:page]
      order[m[:page]] += 1
      uc = UsedComponent.new({ :company_id => current_company.id, :component_id => c.id, :page => m[:page], :partition => 1, :ordering => order[m[:page]] })
      case c.uname
        when 'content'
          uc.setting = { :content => m[:content] }
        when 'infoform'
          uc.setting = { :fields => m[:fields] }.merge({ :names => (m[:names].blank? ? {} : m[:names].keys_to_sym) })
      end
      uc.save
      ucs << uc
    end
    render :json => true
  end

end
