class CreatePostsettings < ActiveRecord::Migration
  def change
    create_table :postsettings do |t|
    t.text :attachment, null: false
      t.string :attachmenttype, null: false
    t.string :posttype, null: false
	t.string :title, null: false
	t.string :author, null: false
     t.timestamps null: false
    end
  end
end
