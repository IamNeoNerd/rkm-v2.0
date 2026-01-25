import re
import sys

def parse_lint(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split by files
    files = re.split(r'\n(?=D:\\)', content)
    
    print("# Lint Report Summary\n")
    print("| File | Errors | Warnings |")
    print("| :--- | :--- | :--- |")
    
    total_errors = 0
    total_warnings = 0
    
    for file_block in files:
        if not file_block.strip(): continue
        
        lines = file_block.split('\n')
        file_path = lines[0].strip()
        
        errors = len([l for l in lines if ' error ' in l])
        warnings = len([l for l in lines if ' warning ' in l])
        
        if errors > 0 or warnings > 0:
            rel_path = file_path.replace('D:\\RKM3.0\\', '')
            print(f"| {rel_path} | {errors} | {warnings} |")
            total_errors += errors
            total_warnings += warnings
            
            if errors > 0:
                print("\n**Critical Errors:**")
                for l in lines:
                    if ' error ' in l:
                        print(f"- {l.strip()}")
                print("")

    print(f"\n**Total: {total_errors} errors, {total_warnings} warnings**")

if __name__ == "__main__":
    parse_lint('lint_results_plain.txt')
