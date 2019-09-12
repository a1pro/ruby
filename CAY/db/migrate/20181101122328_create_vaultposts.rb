class CreateVaultposts < ActiveRecord::Migration
  def change
    create_table :vaultposts do |t|
     
	 t.string :tag, null: false
	t.string :url, null: false
      t.text :attachment, null: false
      t.string :attachmenttype, null: false,default: ''
	  t.string :attachmenturl, null: false, default: ''
	   t.string :title, null: false
      t.timestamps null: false
    end
  end
end
