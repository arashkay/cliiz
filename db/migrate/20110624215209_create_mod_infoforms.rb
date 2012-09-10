class CreateModInfoforms < ActiveRecord::Migration
  def self.up
    create_table :mod_infoforms do |t|
      t.integer :used_component_id
      t.string :name
      t.string :email
      t.string :url
      t.string :phone
      t.string :phone2
      t.string :address
      t.string :subject
      t.text :message

      t.timestamps
    end
  end

  def self.down
    drop_table :mod_infoforms
  end
end
