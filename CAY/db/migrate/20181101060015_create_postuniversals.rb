class CreatePostuniversals < ActiveRecord::Migration
  def change
    create_table :postuniversals do |t|

	t.string :tag, null: false
	 t.string :url, null: false
      t.text :attachment, null: false
      t.string :attachmenttype, null: false
	   t.string :title, null: false
	   t.string :status, null: false
	   t.string :source, null: false
      t.timestamps null: false
    end
  end
end
