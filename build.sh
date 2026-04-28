# Master build script for Vercel Monorepo

# 1. Build Admin Frontend
echo "Building Admin Frontend..."
cd frontend
yarn install
# Inject dummy backend URL for build if needed, or rely on runtime
REACT_APP_BACKEND_URL=/api yarn build
cd ..

# 2. Build Client Frontend
echo "Building Client Frontend..."
cd intellitrade-frontend
yarn install
REACT_APP_BACKEND_URL=/api yarn build
cd ..

# 3. Organize output for Vercel
# Vercel expects static files in the root if we want to serve them directly, 
# but we used rewrites in vercel.json.
# Actually, Vercel's Zero Config for monorepos is better, but since the user wants ONE deploy:

mkdir -p public/admin
cp -r frontend/build/* public/admin/
cp -r intellitrade-frontend/build/* public/
# Move public to root-level for Vercel static serving
mv public/* .
rmdir public
