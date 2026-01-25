import os

def find_error_files(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        current_file = None
        for line in f:
            if line.startswith('D:\\'):
                current_file = line.strip()
            if ' error ' in line:
                print(f"File: {current_file}")
                print(f"  {line.strip()}")

if __name__ == "__main__":
    find_error_files('lint_results_plain.txt')
