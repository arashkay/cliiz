class Folder < ActiveRecord::Base
  
  validates_presence_of :name, :company_id

  belongs_to :folder
  belongs_to :company
  has_many :images, :dependent => :destroy
  has_many :folders, :dependent => :destroy

end
