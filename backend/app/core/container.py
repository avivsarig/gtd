"""Lightweight dependency injection container.

Provides a simple registry pattern for managing dependencies without heavy frameworks.
Supports:
- Type-based registration and resolution
- Singleton pattern for stateless services
- Factory pattern for stateful instances
- Protocol-based interfaces for testability

Usage:
    # Register dependencies
    container.register(TaskRepositoryProtocol, TaskRepository)

    # Resolve dependencies
    repo = container.resolve(TaskRepositoryProtocol)

    # Register singletons
    container.singleton(SearchService, SearchService())
"""

from collections.abc import Callable
from typing import Any, TypeVar, cast

T = TypeVar("T")


class Container:
    """Simple dependency injection container using registry pattern."""

    def __init__(self):
        """Initialize empty registries."""
        self._factories: dict[type, Callable[[], Any]] = {}
        self._singletons: dict[type, Any] = {}

    def register(self, interface: type[T], factory: Callable[[], T]) -> None:
        """Register a factory function for an interface.

        Args:
            interface: The protocol or abstract base class
            factory: Callable that returns an instance of the interface

        Example:
            container.register(TaskRepositoryProtocol, lambda: TaskRepository())
        """
        self._factories[interface] = factory

    def singleton(self, interface: type[T], instance: T) -> None:
        """Register a singleton instance for an interface.

        Args:
            interface: The protocol or abstract base class
            instance: The singleton instance to reuse

        Example:
            container.singleton(SearchService, SearchService())
        """
        self._singletons[interface] = instance

    def resolve(self, interface: type[T]) -> T:
        """Resolve an instance for the given interface.

        Args:
            interface: The protocol or abstract base class to resolve

        Returns:
            Instance implementing the interface

        Raises:
            KeyError: If interface not registered

        Example:
            repo = container.resolve(TaskRepositoryProtocol)
        """
        # Check singletons first
        if interface in self._singletons:
            return cast(T, self._singletons[interface])

        # Then check factories
        if interface in self._factories:
            factory = self._factories[interface]
            return cast(T, factory())

        raise KeyError(
            f"No registration found for {interface.__name__}. "
            f"Use container.register() or container.singleton() first."
        )

    def clear(self) -> None:
        """Clear all registrations. Useful for testing."""
        self._factories.clear()
        self._singletons.clear()


# Global container instance
_container = Container()


def get_container() -> Container:
    """Get the global container instance.

    Returns:
        Global Container instance
    """
    return _container
