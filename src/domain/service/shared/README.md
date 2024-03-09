# Shared Domain Services

Sometimes you may want to call some domain method from other domain. We can inject them in constructor, but it creates a direct dependency.

One way do decouple domains is to create a Shared Interfaces — domain will "expose" some public methods though it. You can call it "Contract".
So dependant domain will depend on it instead of direct dependency.


## Example

```ts
interface DomainASharedMethods {
  someMethodA: () => void;
}

export type SharedDomainMethods = {
  domainA: DomainASharedMethods;
};


class DomainA implements DomainASharedMethods {
  public someMethodA (){}
}

class DomainB {
  constructor(private readonly shared: SharedDomainMethods) {
    this.shared.domainA.someMethodA(); // here we call method of Domain A, but without direct dependency
  }
}
```
