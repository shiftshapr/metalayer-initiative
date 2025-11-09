#!/usr/bin/env python3
"""
Script to migrate markdown files to JAUmemory
Reads markdown files and stores them in JAUmemory with appropriate tags
"""

import os
import json
import glob
from pathlib import Path

def find_markdown_files(root_dir):
    """Find all markdown files excluding node_modules, .git, archive"""
    md_files = []
    exclude_dirs = {'node_modules', '.git', 'archive', '__pycache__', '.next', 'dist', 'build'}
    
    for root, dirs, files in os.walk(root_dir):
        # Filter out excluded directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            if file.endswith('.md'):
                md_files.append(os.path.join(root, file))
    
    return md_files

def read_markdown(filepath):
    """Read markdown file content"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return None

def generate_tags(filepath, filename):
    """Generate tags based on file path and name"""
    tags = ['canopi', 'documentation', 'markdown']
    
    # Add tags based on directory
    if 'presence' in filepath:
        tags.append('presence')
    if 'docs' in filepath:
        tags.append('docs')
    if 'orchestration-reports' in filepath:
        tags.append('orchestration-report')
    
    # Add tags based on filename
    filename_lower = filename.lower()
    if 'audit' in filename_lower:
        tags.append('audit')
    if 'test' in filename_lower:
        tags.append('testing')
    if 'fix' in filename_lower or 'summary' in filename_lower:
        tags.append('fix-summary')
    if 'migration' in filename_lower:
        tags.append('migration')
    if 'architecture' in filename_lower:
        tags.append('architecture')
    if 'setup' in filename_lower:
        tags.append('setup')
    
    # Specific type tags
    if 'red_hat' in filename_lower or 'red-hat' in filename_lower:
        tags.append('red-hat')
    if 'white_hat' in filename_lower or 'white-hat' in filename_lower:
        tags.append('white-hat')
    if 'blue_hat' in filename_lower or 'blue-hat' in filename_lower:
        tags.append('blue-hat')
    if 'purple_hat' in filename_lower or 'purple-hat' in filename_lower:
        tags.append('purple-hat')
    if 'blindspot' in filename_lower:
        tags.append('blindspot')
    if 'ethics' in filename_lower:
        tags.append('ethics')
    if 'devops' in filename_lower:
        tags.append('devops')
    
    return tags

def main():
    root_dir = '/home/ubuntu/metalayer-initiative'
    md_files = find_markdown_files(root_dir)
    
    print(f"Found {len(md_files)} markdown files")
    print("\nFiles to migrate:")
    for md_file in md_files:
        print(f"  - {md_file}")
    
    # Create JSON output for manual migration or API calls
    migrations = []
    
    for md_file in md_files:
        content = read_markdown(md_file)
        if content:
            filename = os.path.basename(md_file)
            rel_path = os.path.relpath(md_file, root_dir)
            tags = generate_tags(md_file, filename)
            
            migrations.append({
                'filepath': md_file,
                'relative_path': rel_path,
                'filename': filename,
                'content': content,
                'tags': tags,
                'title': filename.replace('.md', '').replace('_', ' ').replace('-', ' ')
            })
    
    # Output JSON for review
    output_file = '/home/ubuntu/metalayer-initiative/markdown_migration_data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(migrations, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Generated migration data: {output_file}")
    print(f"   Total files: {len(migrations)}")
    print("\n⚠️  This script generates migration data.")
    print("   Run the JavaScript migration script to actually send to JAUmemory.")

if __name__ == '__main__':
    main()






