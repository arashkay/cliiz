# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20130205054458) do

  create_table "companies", :force => true do |t|
    t.string   "email",                                 :default => "",    :null => false
    t.string   "encrypted_password",     :limit => 128, :default => "",    :null => false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",                         :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "name"
    t.integer  "frame_id"
    t.text     "setting"
    t.string   "domain"
    t.boolean  "is_locked",                             :default => false
    t.boolean  "first_edit_done",                       :default => false
  end

  add_index "companies", ["email"], :name => "index_companies_on_email", :unique => true
  add_index "companies", ["reset_password_token"], :name => "index_companies_on_reset_password_token", :unique => true

  create_table "components", :force => true do |t|
    t.string   "name"
    t.string   "uname"
    t.text     "description"
    t.text     "setting"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "addable"
    t.boolean  "is_package"
  end

  create_table "folders", :force => true do |t|
    t.integer  "company_id"
    t.string   "name"
    t.integer  "folder_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "frames", :force => true do |t|
    t.string   "name"
    t.text     "default"
    t.text     "home"
    t.text     "about"
    t.text     "contact"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "image_file_name"
    t.string   "image_content_type"
    t.integer  "image_file_size"
    t.datetime "image_updated_at"
    t.boolean  "is_private",         :default => false
    t.integer  "order",              :default => 0
    t.string   "tags"
  end

  create_table "images", :force => true do |t|
    t.integer  "company_id"
    t.string   "entity_file_name"
    t.string   "entity_content_type"
    t.integer  "entity_file_size"
    t.datetime "entity_updated_at"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "folder_id"
  end

  create_table "mod_blogs", :force => true do |t|
    t.integer  "used_component_id"
    t.string   "title"
    t.text     "content"
    t.datetime "publish_date"
    t.boolean  "commentable"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "trashed",           :default => "0"
    t.text     "summary"
    t.integer  "image_id"
    t.integer  "view_count",        :default => 0
  end

  add_index "mod_blogs", ["used_component_id"], :name => "fk_mod_blogs_1"

  create_table "mod_galleries", :force => true do |t|
    t.integer  "used_component_id"
    t.string   "title"
    t.integer  "image_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "parent_id"
    t.boolean  "is_album",          :default => false
  end

  create_table "mod_infoforms", :force => true do |t|
    t.integer  "used_component_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "fields"
    t.string   "state"
  end

  add_index "mod_infoforms", ["used_component_id"], :name => "fk_mod_infoforms_1"

  create_table "mod_lists", :force => true do |t|
    t.integer  "used_component_id"
    t.string   "name"
    t.string   "summary"
    t.decimal  "price",             :precision => 8, :scale => 2
    t.text     "description"
    t.boolean  "commentable"
    t.integer  "image_id"
    t.integer  "view_count",                                      :default => 0
    t.datetime "created_at",                                                     :null => false
    t.datetime "updated_at",                                                     :null => false
  end

  create_table "payments", :force => true do |t|
    t.integer  "company_id"
    t.text     "transaction_info"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "used_components", :force => true do |t|
    t.integer  "company_id"
    t.integer  "component_id"
    t.string   "page"
    t.integer  "partition"
    t.integer  "ordering"
    t.text     "setting"
    t.string   "uid"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "disabled"
  end

  add_index "used_components", ["company_id"], :name => "fk_used_components_1"
  add_index "used_components", ["component_id"], :name => "fk_used_components_2"

end
