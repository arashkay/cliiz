class SimplifyModInfoforms < ActiveRecord::Migration
  def change
    remove_column :mod_infoforms, :name
    remove_column :mod_infoforms, :email
    remove_column :mod_infoforms, :url
    remove_column :mod_infoforms, :phone
    remove_column :mod_infoforms, :phone2
    remove_column :mod_infoforms, :address
    remove_column :mod_infoforms, :subject
    remove_column :mod_infoforms, :message
    add_column :mod_infoforms, :fields, :text
    add_column :mod_infoforms, :state, :string
  end
end
