class ModulesController < ApplicationController
  
  layout nil

=begin
  def include
    gen = Generator.new
    @blocks = []
    @stylesheet = ''
    components = UsedComponent.all :conditions => { :uid => params[:md].split("|") }
    components.each do |c|
      @blocks << { :uid => c.uid, :content => gen.create_block(c).gsub("\n",''), :js => c.component.setting[:js] }
      @stylesheet += "#{c.setting[:css]}"
    end
    render 'include.js', :layout => 'jquery.js'
  end
=end

  def base
    render :file => '/modules/base.js'
  end
end
