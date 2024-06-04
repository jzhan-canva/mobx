import * as React from "react"
import { observer as observerLite } from "mobx-react-lite"

import { makeClassComponentObserver, getDisplayName } from "./observerClass"
import { IReactComponent } from "./types/IReactComponent"

const isMobXReactObserverSymbol = Symbol("isMobXReactObserver")

/**
 * Observer function / decorator
 */
export function observer<T extends IReactComponent>(
    component: T,
    context: ClassDecoratorContext
): void
export function observer<T extends IReactComponent>(component: T): T
export function observer<T extends IReactComponent>(
    component: T,
    context?: ClassDecoratorContext
): T {
    if (context && context.kind !== "class") {
        throw new Error("The @observer decorator can be used on classes only")
    }
    if (component["isMobxInjector"] === true) {
        console.warn(
            "Mobx observer: You are trying to use `observer` on a component that already has `inject`. Please apply `observer` before applying `inject`"
        )
    }
    if (component[isMobXReactObserverSymbol]) {
        const displayName = getDisplayName(component as React.ComponentClass)
        throw new Error(
            `The provided component class (${displayName}) has already been declared as an observer component.`
        )
    }

    let observerComponent

    if (
        Object.prototype.isPrototypeOf.call(React.Component, component) ||
        Object.prototype.isPrototypeOf.call(React.PureComponent, component)
    ) {
        // Class component
        observerComponent = makeClassComponentObserver(
            component as React.ComponentClass<any, any>
        ) as T
    } else {
        // Function component
        observerComponent = observerLite(component as React.FunctionComponent<any>) as T
    }
    observerComponent[isMobXReactObserverSymbol] = true
    return observerComponent
}
