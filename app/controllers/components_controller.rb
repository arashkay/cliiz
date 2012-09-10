class ComponentsController < ApplicationController
  
  before_filter :is_admin, :except => [:list_addables, :blocks]

  def list_addables
    render :json => Component.addables
  end
  
  def blocks
    gen = Generator.new
    blocks = {}
    [ 
      CLIIZ::COMPONENTS::CONTENT,
      CLIIZ::COMPONENTS::FORM,
      CLIIZ::COMPONENTS::MAP,
      CLIIZ::COMPONENTS::POSTFILTER,
      CLIIZ::COMPONENTS::YOUTUBE
    ].each { |i| blocks[i] = gen.create_block( UsedComponent.new(:setting => {}, :component => Component.find_by_uname(i), :company => current_company) ) }
    render :json => blocks
  end

  def block_for
    gen = Generator.new
    component = UsedComponent.new :company => current_company, :component => Component.find_by_uname(params[:uname])
    component.setting = params[:setting] 
    render :json => { :content => gen.create_block(component) }
  end

  def index
    @components = Component.all
  end

  def new
    @component = Component.new
  end

  def edit
    @component = Component.find(params[:id])
  end

  def create
    @component = Component.new(params[:component])
    if @component.save
      redirect_to '/components', :notice => 'Component was successfully created.'
    else
      render :action => "new"
    end
  end

  def reinit
    Component.all.each { |c|c.save }
    redirect_to '/components'
  end

  def update
    @component = Component.find(params[:id])
    if @component.update_attributes(params[:component])
      redirect_to '/components', :notice => 'Component was successfully updated.'
    else
      render :action => "edit"
    end
  end

  def destroy
    @component = Component.find params[:id]
    @component.destroy
    redirect_to '/components'
  end

end
