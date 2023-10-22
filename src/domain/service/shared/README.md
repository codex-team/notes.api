# Shared Domain Services

Sometimes you may want to call some domain method from other domain. We can inject them in constructor, but it creates a direct dependency.

One way do decouple domains is to create a Shared Interfaces — domain will "expose" some public methods though it. You can call it "Contract".
So dependant domain will depend on it instead of direct dependency.
