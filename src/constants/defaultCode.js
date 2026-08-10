export const DEFAULT_CODE = {
  javascript: `function greet() {
  console.log("Hello SyncSpace!");
}

greet();`,

  python: `def greet():
    print("Hello SyncSpace!")

greet()`,

  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello SyncSpace!");
    }
}`,

  cpp: `#include <iostream>

using namespace std;

int main() {
    cout << "Hello SyncSpace!";
    return 0;
}`,

  c: `#include <stdio.h>

int main() {
    printf("Hello SyncSpace!");
    return 0;
}`,

  csharp: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello SyncSpace!");
    }
}`,

  go: `package main

import "fmt"

func main() {
    fmt.Println("Hello SyncSpace!")
}`,

  rust: `fn main() {
    println!("Hello SyncSpace!");
}`,

  php: `<?php
echo "Hello SyncSpace!";
?>`,

  ruby: `puts "Hello SyncSpace!"`,
};
