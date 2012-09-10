class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :set_locale

  def set_locale
    I18n.locale = cookies[:locale] || :en
    cookies[:locale] = I18n.locale
  end

  def is_admin
    authenticate_company! if current_company.blank? 
    redirect_to '/panel' if('1@gmail.com'!=current_company.email)
  end

end
