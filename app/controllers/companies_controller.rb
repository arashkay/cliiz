class CompaniesController < ApplicationController
  
  before_filter :authenticate_company!, :except => [:is_new, :not_registered, :current]
  before_filter :is_admin, :only => [:all, :menu]
  
  def is_new
    render :json => Company.find_by_name(params[:name]).blank?
  end

  def not_registered
    render :json => Company.find_by_email(params[:email]).blank?
  end

  def enable_package
    render :json => UsedComponent.enable_package( current_company, params['name'])
  end

  def disable_package
    render :json => UsedComponent.disable_package( current_company, params['name'])
  end

  def frame
    current_company.update_attribute( 'frame_id', params[:id] )
    render :json => current_company
  end

  def temp_frame
    current_company.setting[:temp_frame_id] = params[:id]
    current_company.save
    render :json => true
  end

  def reset_temp_frame
    current_company.setting[:temp_frame_id] = nil
    current_company.save
    render :json => true
  end

  def current
    render :json => current_company
  end

  def profile
    @company = current_company
  end

  def update_profile
    @company = current_company
    setting = @company.setting.deep_merge({ 
        :display_name       => params[:company][:display_name], 
        :logo               => params[:company][:logo], 
        :description        => params[:company][:description], 
        :keywords           => params[:company][:keywords],
        :twitter            => params[:company][:twitter],
        :facebookpage       => params[:company][:facebookpage],
        :google_verify      => params[:company][:google_verify],
        :google_analytic    => params[:company][:google_analytic]
      })
    refresh_site!
    render :json => @company.update_attributes({ :setting => setting })
  end

  def menu
    @company = Company.find params[:id]
    @company.setting[:menu][0][2] = params[:home] unless params[:home].blank?
    @company.setting[:menu][1][2] = params[:about] unless params[:about].blank?
    @company.setting[:menu][2][2] = params[:contact] unless params[:contact].blank?
    @company.save
    refresh_site!
    redirect_to '/panel'
  end
  
  def first_edit_done
    render :json => current_company.update_attribute(:first_edit_done, true)
  end

  def all
    @companies = Company.all :order => 'created_at DESC'
  end

end
