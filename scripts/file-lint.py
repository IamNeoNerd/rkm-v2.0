import sys

def get_file_lint(filename, target_file):
    with open(filename, 'r', encoding='utf-8') as f:
        found = False
        for line in f:
            if line.strip() == f"D:\\RKM3.0\\{target_file}":
                found = True
                print(line.strip())
                continue
            if found:
                if line.startswith('D:\\'):
                    break
                if line.strip():
                    print(line.strip())

if __name__ == "__main__":
    get_file_lint('lint_results_plain.txt', sys.argv[1])
