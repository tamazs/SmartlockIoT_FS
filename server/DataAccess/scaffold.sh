set -a
source .env
set +a

dotnet tool install -g dotnet-ef && dotnet ef dbcontext scaffold "$CONN_STR" Npgsql.EntityFrameworkCore.PostgreSQL   --context AppDbContext     --no-onconfiguring        --schema public  --force