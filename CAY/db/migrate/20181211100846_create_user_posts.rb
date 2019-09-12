class CreateUserPosts < ActiveRecord::Migration
  def change
    create_table :user_posts do |t|
     t.integer :userid, null: false
	t.string :title, null: false
	t.text :description, null: false
	t.text :attachment, null: false
	t.string :victory_type, null: false
      t.timestamps null: false
      t.timestamps null: false
    end
  end
end
