BASE URL: https://microbizmate.et.r.appspot.com/

LINK CLOUD STORAGE : gs://microbizmate.appspot.com

UNTUK PATH NYA : 

[1] - Register POST https://microbizmate.et.r.appspot.com/v1/auth/register

req : { "name": "", "email": "", "password": "" }

[2] Login POST https://microbizmate.et.r.appspot.com/v1/auth/login

req : { "email": "", "password": "" }

[3] Add new stories POST https://microbizmate.et.r.appspot.com/v1/stories

res : { "error": false, "message": "success" }

[4] Add New Story with Guest Account (without Authentication) POST https://microbizmate.et.r.appspot.com/v1/stories/guest

res : { "error": false, "message": "success" }

[5] All Stories GET https://microbizmate.et.r.appspot.com/v1/stories

res : {"error": false, "message": "Story fetched successfully", "story": { "id": "", "name": "", "description": "", "photoUrl": "", "createdAt": "", "lat": , "lon": } }

[6] Stories by ID GET https://microbizmate.et.r.appspot.com/v1/stories/:id

res : {"error": false, "message": "Story fetched successfully", "story": { "id": "", "name": "", "description": "", "photoUrl": "", "createdAt": "", "lat": , "lon": } }



untuk test nya add stories :

1. Buka postman
2. method POST, masukkan link https://microbizmate.et.r.appspot.com/v1/stories
3. di Authorization -> masukan bearer token login
4. ke Body
5. pilih form-data ( bukan raw )
   -> key : dropdown pilih file
   -> value : select file
   -> content type : multipart/form-data
6. click send di samping link

