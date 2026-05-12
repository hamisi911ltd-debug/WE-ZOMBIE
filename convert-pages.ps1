# Convert TanStack Router pages to React Router pages

$pages = @(
    "Landing",
    "Login", 
    "Signup",
    "Dashboard",
    "Courses",
    "CourseDetail",
    "ModuleDetail",
    "Payments",
    "Schedule",
    "Students"
)

foreach ($page in $pages) {
    $file = "src/pages/$page.tsx"
    if (Test-Path $file) {
        Write-Host "Converting $file..."
        
        $content = Get-Content $file -Raw
        
        # Replace TanStack Router imports with React Router
        $content = $content -replace 'import \{ createFileRoute, ([^}]+) \} from "@tanstack/react-router";', 'import { $1 } from "react-router-dom";'
        $content = $content -replace 'import \{ ([^}]*?)useNavigate([^}]*?) \} from "@tanstack/react-router";', 'import { $1useNavigate$2 } from "react-router-dom";'
        $content = $content -replace 'import \{ ([^}]*?)useParams([^}]*?) \} from "@tanstack/react-router";', 'import { $1useParams$2 } from "react-router-dom";'
        $content = $content -replace 'import \{ ([^}]*?)Link([^}]*?) \} from "@tanstack/react-router";', 'import { $1Link$2 } from "react-router-dom";'
        $content = $content -replace 'from "@tanstack/react-router"', 'from "react-router-dom"'
        
        # Remove Route export
        $content = $content -replace 'export const Route = createFileRoute\([^)]+\)\(\{[^}]+\}\);[\r\n]+', ''
        
        # Convert function to default export
        $content = $content -replace 'function ([A-Z][a-zA-Z]+)\(\)', 'export default function $1()'
        
        # Fix useParams calls
        $content = $content -replace 'Route\.useParams\(\)', 'useParams()'
        $content = $content -replace 'const \{ ([^}]+) \} = useParams\(\);', 'const { $1 } = useParams<{ $1: string }>();'
        
        # Fix navigation calls
        $content = $content -replace 'nav\(\{ to: "([^"]+)" \}\)', 'navigate("$1")'
        $content = $content -replace 'nav\(\{ to: ([^}]+) \}\)', 'navigate($1)'
        
        Set-Content $file $content -NoNewline
        Write-Host "✓ Converted $file"
    }
}

Write-Host "`n✅ All pages converted!"
