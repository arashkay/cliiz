class CompanyMailer < ActionMailer::Base
  default :from => "Tectual Request<request@tectual.com.au>"
  
  def upgrade_email(company)
    @company = company
    mail :to => 'info@tectual.com.au', :cc => 'arash@tectual.com.au', :subject => "Your website is upgraded!"
  end

end
