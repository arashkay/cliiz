class ModInfoform < ActiveRecord::Base

  belongs_to :used_component
  serialize :fields, JSON
  
  scope :new_items, where( :state => 'new' )
  scope :old_items, where( :state => 'seen' )

  include AASM
  aasm :column => :state do
    state :new, :initial => true
    state :seen

    event :see do
      transitions :from => :new, :to => :seen
    end
  end 
  
  def fields=(params)
    hash = {}
    used_component.setting[:fields].each { |k, field| hash[field[0]] = params["field#{field[0]}"] }
    write_attribute :fields, hash
  end
end
